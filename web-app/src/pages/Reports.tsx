import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DocumentArrowDownIcon,
  UsersIcon,
  HeartIcon,
  FaceSmileIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  RiskBadge,
  Input,
  Badge,
} from '@/components/ui'
import { patientService, dashboardService, userService } from '@/services'
import { Patient, PatientStatus, RiskLevel, User, DeliveryOutcome } from '@/types'
import toast from 'react-hot-toast'

// Get default date range (last 30 days)
const getDefaultStartDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split('T')[0]
}

const getDefaultEndDate = () => {
  return new Date().toISOString().split('T')[0]
}

// PDF generation helper for active patients
const generateActivePatientsPDF = async (patients: Patient[], _doctors: User[], title: string, dateRange?: { start: string, end: string }) => {
  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dateRangeText = dateRange
    ? `Date Range: ${new Date(dateRange.start).toLocaleDateString('en-IN')} - ${new Date(dateRange.end).toLocaleDateString('en-IN')}`
    : ''

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Amma Rakshitha - ${title}</title>
      <style>
        @page { size: A4 landscape; margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
        .header h1 { color: #1e40af; margin: 0; font-size: 20px; }
        .header h2 { color: #374151; margin: 5px 0; font-size: 14px; font-weight: normal; }
        .header p { color: #6b7280; margin: 5px 0; font-size: 11px; }
        .govt-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .govt-info span { color: #4b5563; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #2563eb; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
        td { border: 1px solid #d1d5db; padding: 6px; font-size: 10px; }
        tr:nth-child(even) { background-color: #f3f4f6; }
        .risk-red { background-color: #fecaca; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .risk-yellow { background-color: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .risk-green { background-color: #bbf7d0; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .summary { margin-top: 20px; display: flex; gap: 20px; }
        .summary-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 10px 15px; border-radius: 5px; flex: 1; }
        .summary-box h4 { margin: 0; color: #0369a1; font-size: 12px; }
        .summary-box p { margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #1e40af; }
        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 10px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="govt-info">
          <span>Government of Telangana</span>
          <span>District Nirmal</span>
        </div>
        <h1>AMMA RAKSHITHA</h1>
        <h2>Maternal Healthcare Management System</h2>
        <p>${title} - Generated on ${reportDate}</p>
        ${dateRangeText ? `<p>${dateRangeText}</p>` : ''}
      </div>

      <div class="summary">
        <div class="summary-box">
          <h4>Total Records</h4>
          <p>${patients.length}</p>
        </div>
        <div class="summary-box">
          <h4>High Risk (RED)</h4>
          <p>${patients.filter(p => p.currentRiskLevel === 'RED').length}</p>
        </div>
        <div class="summary-box">
          <h4>Moderate Risk (YELLOW)</h4>
          <p>${patients.filter(p => p.currentRiskLevel === 'YELLOW').length}</p>
        </div>
        <div class="summary-box">
          <h4>Low Risk (GREEN)</h4>
          <p>${patients.filter(p => p.currentRiskLevel === 'GREEN').length}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Mother ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Mobile</th>
            <th>Village/Mandal</th>
            <th>LMP Date</th>
            <th>EDD</th>
            <th>Risk Level</th>
            <th>Blood Group</th>
            <th>Gravida/Para</th>
          </tr>
        </thead>
        <tbody>
          ${patients.map((p, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${p.motherId}</td>
              <td>${p.name}</td>
              <td>${p.age}</td>
              <td>${p.mobileNumber}</td>
              <td>${p.village || '-'}/${p.mandal || '-'}</td>
              <td>${p.lmpDate ? new Date(p.lmpDate).toLocaleDateString('en-IN') : '-'}</td>
              <td>${p.eddDate ? new Date(p.eddDate).toLocaleDateString('en-IN') : '-'}</td>
              <td><span class="risk-${p.currentRiskLevel?.toLowerCase() || 'green'}">${p.currentRiskLevel || 'GREEN'}</span></td>
              <td>${p.bloodGroup || '-'}</td>
              <td>${p.gravida || 0}/${p.para || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This is a computer-generated report from Amma Rakshitha - Maternal Healthcare Management System</p>
        <p>Government of Telangana, District Nirmal</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

// PDF generation helper for mortality report
const generateMortalityPDF = async (patients: Patient[], dateRange: { start: string, end: string }) => {
  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const motherMortality = patients.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.MOTHER_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  )
  const babyMortality = patients.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.BABY_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  )

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Amma Rakshitha - Mortality Report</title>
      <style>
        @page { size: A4 landscape; margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 15px; }
        .header h1 { color: #dc2626; margin: 0; font-size: 20px; }
        .header h2 { color: #374151; margin: 5px 0; font-size: 14px; font-weight: normal; }
        .header p { color: #6b7280; margin: 5px 0; font-size: 11px; }
        .govt-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .govt-info span { color: #4b5563; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #dc2626; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
        td { border: 1px solid #d1d5db; padding: 6px; font-size: 10px; }
        tr:nth-child(even) { background-color: #fef2f2; }
        .summary { margin-top: 20px; display: flex; gap: 20px; margin-bottom: 20px; }
        .summary-box { background: #fef2f2; border: 1px solid #fecaca; padding: 10px 15px; border-radius: 5px; flex: 1; }
        .summary-box h4 { margin: 0; color: #dc2626; font-size: 12px; }
        .summary-box p { margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #991b1b; }
        .section-title { margin-top: 30px; font-size: 14px; font-weight: bold; color: #991b1b; border-bottom: 1px solid #dc2626; padding-bottom: 5px; }
        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 10px; }
        .important-note { background: #fef2f2; border: 1px solid #dc2626; padding: 10px; margin-top: 20px; font-size: 10px; color: #991b1b; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="govt-info">
          <span>Government of Telangana</span>
          <span>District Nirmal</span>
        </div>
        <h1>AMMA RAKSHITHA - MORTALITY REPORT</h1>
        <h2>Maternal Healthcare Management System</h2>
        <p>Date Range: ${new Date(dateRange.start).toLocaleDateString('en-IN')} - ${new Date(dateRange.end).toLocaleDateString('en-IN')}</p>
        <p>Generated on ${reportDate}</p>
      </div>

      <div class="summary">
        <div class="summary-box">
          <h4>Total Mortality Cases</h4>
          <p>${patients.length}</p>
        </div>
        <div class="summary-box">
          <h4>Mother Mortality</h4>
          <p>${motherMortality.length}</p>
        </div>
        <div class="summary-box">
          <h4>Baby Mortality</h4>
          <p>${babyMortality.length}</p>
        </div>
      </div>

      <div class="section-title">Mother Mortality Cases (${motherMortality.length})</div>
      ${motherMortality.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Mother ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Mobile</th>
            <th>Alternate Mobile</th>
            <th>Village/Mandal/District</th>
            <th>Mortality Date</th>
            <th>Cause</th>
            <th>Delivery Type</th>
            <th>Hospital</th>
          </tr>
        </thead>
        <tbody>
          ${motherMortality.map((p, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${p.motherId}</td>
              <td>${p.name}</td>
              <td>${p.age}</td>
              <td>${p.mobileNumber}</td>
              <td>${p.alternateMobile || '-'}</td>
              <td>${p.village || '-'}/${p.mandal || '-'}/${p.district || '-'}</td>
              <td>${p.mortalityDate ? new Date(p.mortalityDate).toLocaleDateString('en-IN') : '-'}</td>
              <td>${p.mortalityCause || 'Not specified'}</td>
              <td>${p.deliveryType || '-'}</td>
              <td>${p.deliveryHospital || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p>No mother mortality cases in this period.</p>'}

      <div class="section-title">Baby Mortality Cases (${babyMortality.length})</div>
      ${babyMortality.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Mother ID</th>
            <th>Mother Name</th>
            <th>Age</th>
            <th>Mobile</th>
            <th>Alternate Mobile</th>
            <th>Village/Mandal/District</th>
            <th>Mortality Date</th>
            <th>Cause</th>
            <th>Baby Gender</th>
            <th>Delivery Type</th>
            <th>Hospital</th>
          </tr>
        </thead>
        <tbody>
          ${babyMortality.map((p, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${p.motherId}</td>
              <td>${p.name}</td>
              <td>${p.age}</td>
              <td>${p.mobileNumber}</td>
              <td>${p.alternateMobile || '-'}</td>
              <td>${p.village || '-'}/${p.mandal || '-'}/${p.district || '-'}</td>
              <td>${p.mortalityDate ? new Date(p.mortalityDate).toLocaleDateString('en-IN') : '-'}</td>
              <td>${p.mortalityCause || 'Not specified'}</td>
              <td>${p.babyGender || '-'}</td>
              <td>${p.deliveryType || '-'}</td>
              <td>${p.deliveryHospital || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p>No baby mortality cases in this period.</p>'}

      <div class="important-note">
        <strong>IMPORTANT:</strong> This report contains sensitive medical information and is intended for official government use only.
        Please handle with care and ensure proper data protection measures are followed.
      </div>

      <div class="footer">
        <p>This is a computer-generated report from Amma Rakshitha - Maternal Healthcare Management System</p>
        <p>For Government of Telangana, District Nirmal - Official Use Only</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

// PDF generation helper for deliveries report with mortality highlighting
const generateDeliveriesPDF = async (patients: Patient[], dateRange: { start: string, end: string }) => {
  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const successfulCount = patients.filter(p => p.deliveryOutcome === DeliveryOutcome.SUCCESSFUL).length
  const motherMortalityCount = patients.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.MOTHER_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  ).length
  const babyMortalityCount = patients.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.BABY_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  ).length

  const getOutcomeClass = (outcome: DeliveryOutcome | undefined) => {
    switch (outcome) {
      case DeliveryOutcome.SUCCESSFUL:
        return 'outcome-success'
      case DeliveryOutcome.MOTHER_MORTALITY:
        return 'outcome-mother-death'
      case DeliveryOutcome.BABY_MORTALITY:
        return 'outcome-baby-death'
      case DeliveryOutcome.BOTH_MORTALITY:
        return 'outcome-both-death'
      default:
        return ''
    }
  }

  const getOutcomeReason = (outcome: DeliveryOutcome | undefined) => {
    switch (outcome) {
      case DeliveryOutcome.SUCCESSFUL:
        return 'Successful'
      case DeliveryOutcome.MOTHER_MORTALITY:
        return 'Mother did not survive'
      case DeliveryOutcome.BABY_MORTALITY:
        return 'Baby did not survive'
      case DeliveryOutcome.BOTH_MORTALITY:
        return 'Both did not survive'
      default:
        return '-'
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Amma Rakshitha - Deliveries Report</title>
      <style>
        @page { size: A4 landscape; margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
        .header h1 { color: #1e40af; margin: 0; font-size: 20px; }
        .header h2 { color: #374151; margin: 5px 0; font-size: 14px; font-weight: normal; }
        .header p { color: #6b7280; margin: 5px 0; font-size: 11px; }
        .govt-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .govt-info span { color: #4b5563; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #2563eb; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
        td { border: 1px solid #d1d5db; padding: 6px; font-size: 10px; }
        tr:nth-child(even) { background-color: #f3f4f6; }

        /* Outcome-based row coloring */
        .outcome-success { background-color: #dcfce7 !important; }
        .outcome-mother-death { background-color: #fee2e2 !important; }
        .outcome-baby-death { background-color: #fef3c7 !important; }
        .outcome-both-death { background-color: #fecaca !important; }

        /* Outcome badges */
        .badge-success { background-color: #16a34a; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .badge-mother-death { background-color: #dc2626; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .badge-baby-death { background-color: #d97706; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .badge-both-death { background-color: #7f1d1d; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; }

        .summary { margin-top: 20px; display: flex; gap: 15px; }
        .summary-box { padding: 10px 15px; border-radius: 5px; flex: 1; }
        .summary-box.total { background: #f0f9ff; border: 1px solid #bae6fd; }
        .summary-box.success { background: #dcfce7; border: 1px solid #86efac; }
        .summary-box.mother { background: #fee2e2; border: 1px solid #fecaca; }
        .summary-box.baby { background: #fef3c7; border: 1px solid #fde68a; }
        .summary-box h4 { margin: 0; font-size: 11px; }
        .summary-box p { margin: 5px 0 0; font-size: 18px; font-weight: bold; }
        .legend { margin-top: 15px; display: flex; gap: 20px; font-size: 10px; }
        .legend-item { display: flex; align-items: center; gap: 5px; }
        .legend-color { width: 15px; height: 15px; border-radius: 3px; }
        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 10px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="govt-info">
          <span>Government of Telangana</span>
          <span>District Nirmal</span>
        </div>
        <h1>AMMA RAKSHITHA - DELIVERIES REPORT</h1>
        <h2>Maternal Healthcare Management System</h2>
        <p>Date Range: ${new Date(dateRange.start).toLocaleDateString('en-IN')} - ${new Date(dateRange.end).toLocaleDateString('en-IN')}</p>
        <p>Generated on ${reportDate}</p>
      </div>

      <div class="summary">
        <div class="summary-box total">
          <h4>Total Deliveries</h4>
          <p style="color: #0369a1;">${patients.length}</p>
        </div>
        <div class="summary-box success">
          <h4>Successful Deliveries</h4>
          <p style="color: #16a34a;">${successfulCount}</p>
        </div>
        <div class="summary-box mother">
          <h4>Mother Mortality</h4>
          <p style="color: #dc2626;">${motherMortalityCount}</p>
        </div>
        <div class="summary-box baby">
          <h4>Baby Mortality</h4>
          <p style="color: #d97706;">${babyMortalityCount}</p>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item"><div class="legend-color" style="background: #dcfce7;"></div> Successful Delivery</div>
        <div class="legend-item"><div class="legend-color" style="background: #fee2e2;"></div> Mother Mortality</div>
        <div class="legend-item"><div class="legend-color" style="background: #fef3c7;"></div> Baby Mortality</div>
        <div class="legend-item"><div class="legend-color" style="background: #fecaca;"></div> Both Mortality</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Mother ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Mobile</th>
            <th>Delivery Date</th>
            <th>Delivery Type</th>
            <th>Outcome</th>
            <th>Reason</th>
            <th>Death Date/Time</th>
            <th>Cause of Death</th>
            <th>Hospital</th>
          </tr>
        </thead>
        <tbody>
          ${patients.map((p, idx) => `
            <tr class="${getOutcomeClass(p.deliveryOutcome)}">
              <td>${idx + 1}</td>
              <td>${p.motherId}</td>
              <td>${p.name}</td>
              <td>${p.age}</td>
              <td>${p.mobileNumber}</td>
              <td>${p.deliveryDate ? new Date(p.deliveryDate).toLocaleDateString('en-IN') : '-'}</td>
              <td>${p.deliveryType || '-'}</td>
              <td>
                <span class="badge-${p.deliveryOutcome === DeliveryOutcome.SUCCESSFUL ? 'success' :
                  p.deliveryOutcome === DeliveryOutcome.MOTHER_MORTALITY ? 'mother-death' :
                  p.deliveryOutcome === DeliveryOutcome.BABY_MORTALITY ? 'baby-death' : 'both-death'}">
                  ${p.deliveryOutcome?.replace('_', ' ') || '-'}
                </span>
              </td>
              <td>${getOutcomeReason(p.deliveryOutcome)}</td>
              <td>${p.mortalityDate ? new Date(p.mortalityDate).toLocaleDateString('en-IN') + (p.deliveryCompletedAt ? ' ' + new Date(p.deliveryCompletedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '') : '-'}</td>
              <td>${p.mortalityCause || '-'}</td>
              <td>${p.deliveryHospital || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This is a computer-generated report from Amma Rakshitha - Maternal Healthcare Management System</p>
        <p>Government of Telangana, District Nirmal</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

// Report type options
type ReportType = 'active' | 'deliveries' | 'mortality'

interface ReportData {
  activePatients: Patient[]
  deliveries: Patient[]
  mortalityCases: Patient[]
  dateRange: { start: string; end: string }
}

// Comprehensive PDF generator that combines multiple report sections
const generateComprehensivePDF = async (
  reportTypes: ReportType[],
  data: ReportData
) => {
  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const includeActive = reportTypes.includes('active')
  const includeDeliveries = reportTypes.includes('deliveries')
  const includeMortality = reportTypes.includes('mortality')

  const titleParts = []
  if (includeActive) titleParts.push('Active Pregnant Ladies')
  if (includeDeliveries) titleParts.push('Deliveries')
  if (includeMortality) titleParts.push('Mortality')
  const reportTitle = reportTypes.length === 3 ? 'Comprehensive Report' : titleParts.join(' & ') + ' Report'

  // Calculate stats
  const motherMortality = data.mortalityCases.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.MOTHER_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  )
  const babyMortality = data.mortalityCases.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.BABY_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  )
  const successfulDeliveries = data.deliveries.filter(p => p.deliveryOutcome === DeliveryOutcome.SUCCESSFUL)

  const getOutcomeClass = (outcome: DeliveryOutcome | undefined) => {
    switch (outcome) {
      case DeliveryOutcome.SUCCESSFUL: return 'outcome-success'
      case DeliveryOutcome.MOTHER_MORTALITY: return 'outcome-mother-death'
      case DeliveryOutcome.BABY_MORTALITY: return 'outcome-baby-death'
      case DeliveryOutcome.BOTH_MORTALITY: return 'outcome-both-death'
      default: return ''
    }
  }

  const getOutcomeReason = (outcome: DeliveryOutcome | undefined) => {
    switch (outcome) {
      case DeliveryOutcome.SUCCESSFUL: return 'Successful'
      case DeliveryOutcome.MOTHER_MORTALITY: return 'Mother did not survive'
      case DeliveryOutcome.BABY_MORTALITY: return 'Baby did not survive'
      case DeliveryOutcome.BOTH_MORTALITY: return 'Both did not survive'
      default: return '-'
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Amma Rakshitha - ${reportTitle}</title>
      <style>
        @page { size: A4 landscape; margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
        .header h1 { color: #1e40af; margin: 0; font-size: 20px; }
        .header h2 { color: #374151; margin: 5px 0; font-size: 14px; font-weight: normal; }
        .header p { color: #6b7280; margin: 5px 0; font-size: 11px; }
        .govt-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .govt-info span { color: #4b5563; font-size: 10px; }

        .overview-stats { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .stat-box { flex: 1; min-width: 120px; padding: 10px; border-radius: 5px; text-align: center; }
        .stat-box.blue { background: #dbeafe; border: 1px solid #93c5fd; }
        .stat-box.green { background: #dcfce7; border: 1px solid #86efac; }
        .stat-box.red { background: #fee2e2; border: 1px solid #fecaca; }
        .stat-box.yellow { background: #fef3c7; border: 1px solid #fde68a; }
        .stat-box h4 { margin: 0; font-size: 10px; color: #374151; }
        .stat-box p { margin: 5px 0 0; font-size: 18px; font-weight: bold; }

        .section { margin-top: 30px; page-break-inside: avoid; }
        .section-title { font-size: 14px; font-weight: bold; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 10px; }
        .section-title.mortality { color: #dc2626; border-color: #dc2626; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
        th { background-color: #2563eb; color: white; padding: 6px 4px; text-align: left; }
        th.mortality { background-color: #dc2626; }
        td { border: 1px solid #d1d5db; padding: 4px; }
        tr:nth-child(even) { background-color: #f3f4f6; }

        .risk-red { background-color: #fecaca; color: #991b1b; padding: 2px 4px; border-radius: 3px; font-weight: bold; }
        .risk-yellow { background-color: #fef08a; color: #854d0e; padding: 2px 4px; border-radius: 3px; font-weight: bold; }
        .risk-green { background-color: #bbf7d0; color: #166534; padding: 2px 4px; border-radius: 3px; font-weight: bold; }

        .outcome-success { background-color: #dcfce7 !important; }
        .outcome-mother-death { background-color: #fee2e2 !important; }
        .outcome-baby-death { background-color: #fef3c7 !important; }
        .outcome-both-death { background-color: #fecaca !important; }

        .badge-success { background-color: #16a34a; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; }
        .badge-mother-death { background-color: #dc2626; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; }
        .badge-baby-death { background-color: #d97706; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; }
        .badge-both-death { background-color: #7f1d1d; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; }

        .legend { margin: 10px 0; display: flex; gap: 15px; font-size: 9px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 4px; }
        .legend-color { width: 12px; height: 12px; border-radius: 2px; }

        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 10px; }
        .page-break { page-break-before: always; }

        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="govt-info">
          <span>Government of Telangana</span>
          <span>District Nirmal</span>
        </div>
        <h1>AMMA RAKSHITHA</h1>
        <h2>Maternal Healthcare Management System - ${reportTitle}</h2>
        <p>Date Range: ${new Date(data.dateRange.start).toLocaleDateString('en-IN')} - ${new Date(data.dateRange.end).toLocaleDateString('en-IN')}</p>
        <p>Generated on ${reportDate}</p>
      </div>

      <!-- Overview Statistics -->
      <div class="overview-stats">
        ${includeActive ? `<div class="stat-box blue"><h4>Active Pregnant Ladies</h4><p style="color:#1e40af;">${data.activePatients.length}</p></div>` : ''}
        ${includeDeliveries ? `<div class="stat-box green"><h4>Total Deliveries</h4><p style="color:#16a34a;">${data.deliveries.length}</p></div>` : ''}
        ${includeDeliveries ? `<div class="stat-box green"><h4>Successful Deliveries</h4><p style="color:#16a34a;">${successfulDeliveries.length}</p></div>` : ''}
        ${includeMortality ? `<div class="stat-box red"><h4>Mother Mortality</h4><p style="color:#dc2626;">${motherMortality.length}</p></div>` : ''}
        ${includeMortality ? `<div class="stat-box yellow"><h4>Baby Mortality</h4><p style="color:#d97706;">${babyMortality.length}</p></div>` : ''}
      </div>

      ${includeActive && data.activePatients.length > 0 ? `
      <!-- Active Pregnant Ladies Section -->
      <div class="section">
        <div class="section-title">Active Pregnant Ladies (${data.activePatients.length})</div>
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background:#fecaca;"></div> High Risk (RED)</div>
          <div class="legend-item"><div class="legend-color" style="background:#fef08a;"></div> Moderate Risk (YELLOW)</div>
          <div class="legend-item"><div class="legend-color" style="background:#bbf7d0;"></div> Low Risk (GREEN)</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Mother ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Mobile</th>
              <th>Village/Mandal</th>
              <th>LMP Date</th>
              <th>EDD</th>
              <th>Risk Level</th>
              <th>Blood Group</th>
              <th>Gravida/Para</th>
            </tr>
          </thead>
          <tbody>
            ${data.activePatients.map((p, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${p.motherId}</td>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.mobileNumber}</td>
                <td>${p.village || '-'}/${p.mandal || '-'}</td>
                <td>${p.lmpDate ? new Date(p.lmpDate).toLocaleDateString('en-IN') : '-'}</td>
                <td>${p.eddDate ? new Date(p.eddDate).toLocaleDateString('en-IN') : '-'}</td>
                <td><span class="risk-${p.currentRiskLevel?.toLowerCase() || 'green'}">${p.currentRiskLevel || 'GREEN'}</span></td>
                <td>${p.bloodGroup || '-'}</td>
                <td>${p.gravida || 0}/${p.para || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${includeDeliveries && data.deliveries.length > 0 ? `
      <!-- Deliveries Section -->
      <div class="section ${includeActive ? 'page-break' : ''}">
        <div class="section-title">Deliveries Report (${data.deliveries.length})</div>
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background:#dcfce7;"></div> Successful</div>
          <div class="legend-item"><div class="legend-color" style="background:#fee2e2;"></div> Mother Mortality</div>
          <div class="legend-item"><div class="legend-color" style="background:#fef3c7;"></div> Baby Mortality</div>
          <div class="legend-item"><div class="legend-color" style="background:#fecaca;"></div> Both Mortality</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Mother ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Mobile</th>
              <th>Delivery Date</th>
              <th>Type</th>
              <th>Outcome</th>
              <th>Reason</th>
              <th>Death Date</th>
              <th>Cause</th>
              <th>Hospital</th>
            </tr>
          </thead>
          <tbody>
            ${data.deliveries.map((p, idx) => `
              <tr class="${getOutcomeClass(p.deliveryOutcome)}">
                <td>${idx + 1}</td>
                <td>${p.motherId}</td>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.mobileNumber}</td>
                <td>${p.deliveryDate ? new Date(p.deliveryDate).toLocaleDateString('en-IN') : '-'}</td>
                <td>${p.deliveryType || '-'}</td>
                <td><span class="badge-${p.deliveryOutcome === DeliveryOutcome.SUCCESSFUL ? 'success' : p.deliveryOutcome === DeliveryOutcome.MOTHER_MORTALITY ? 'mother-death' : p.deliveryOutcome === DeliveryOutcome.BABY_MORTALITY ? 'baby-death' : 'both-death'}">${p.deliveryOutcome?.replace('_', ' ') || '-'}</span></td>
                <td>${getOutcomeReason(p.deliveryOutcome)}</td>
                <td>${p.mortalityDate ? new Date(p.mortalityDate).toLocaleDateString('en-IN') : '-'}</td>
                <td>${p.mortalityCause || '-'}</td>
                <td>${p.deliveryHospital || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${includeMortality && data.mortalityCases.length > 0 ? `
      <!-- Mortality Section -->
      <div class="section ${includeActive || includeDeliveries ? 'page-break' : ''}">
        <div class="section-title mortality">Mortality Report (${data.mortalityCases.length} cases)</div>

        ${motherMortality.length > 0 ? `
        <h4 style="color:#dc2626; margin-top:15px;">Mother Mortality Cases (${motherMortality.length})</h4>
        <table>
          <thead>
            <tr>
              <th class="mortality">S.No</th>
              <th class="mortality">Mother ID</th>
              <th class="mortality">Name</th>
              <th class="mortality">Age</th>
              <th class="mortality">Mobile</th>
              <th class="mortality">Alt Mobile</th>
              <th class="mortality">Village/Mandal/District</th>
              <th class="mortality">Death Date</th>
              <th class="mortality">Cause</th>
              <th class="mortality">Hospital</th>
            </tr>
          </thead>
          <tbody>
            ${motherMortality.map((p, idx) => `
              <tr style="background-color:#fee2e2;">
                <td>${idx + 1}</td>
                <td>${p.motherId}</td>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.mobileNumber}</td>
                <td>${p.alternateMobile || '-'}</td>
                <td>${p.village || '-'}/${p.mandal || '-'}/${p.district || '-'}</td>
                <td>${p.mortalityDate ? new Date(p.mortalityDate).toLocaleDateString('en-IN') : '-'}</td>
                <td>${p.mortalityCause || 'Not specified'}</td>
                <td>${p.deliveryHospital || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${babyMortality.length > 0 ? `
        <h4 style="color:#d97706; margin-top:20px;">Baby Mortality Cases (${babyMortality.length})</h4>
        <table>
          <thead>
            <tr>
              <th class="mortality" style="background:#d97706;">S.No</th>
              <th class="mortality" style="background:#d97706;">Mother ID</th>
              <th class="mortality" style="background:#d97706;">Mother Name</th>
              <th class="mortality" style="background:#d97706;">Age</th>
              <th class="mortality" style="background:#d97706;">Mobile</th>
              <th class="mortality" style="background:#d97706;">Alt Mobile</th>
              <th class="mortality" style="background:#d97706;">Village/Mandal/District</th>
              <th class="mortality" style="background:#d97706;">Death Date</th>
              <th class="mortality" style="background:#d97706;">Cause</th>
              <th class="mortality" style="background:#d97706;">Baby Gender</th>
              <th class="mortality" style="background:#d97706;">Hospital</th>
            </tr>
          </thead>
          <tbody>
            ${babyMortality.map((p, idx) => `
              <tr style="background-color:#fef3c7;">
                <td>${idx + 1}</td>
                <td>${p.motherId}</td>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.mobileNumber}</td>
                <td>${p.alternateMobile || '-'}</td>
                <td>${p.village || '-'}/${p.mandal || '-'}/${p.district || '-'}</td>
                <td>${p.mortalityDate ? new Date(p.mortalityDate).toLocaleDateString('en-IN') : '-'}</td>
                <td>${p.mortalityCause || 'Not specified'}</td>
                <td>${p.babyGender || '-'}</td>
                <td>${p.deliveryHospital || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}
      </div>
      ` : ''}

      <div class="footer">
        <p>This is a computer-generated report from Amma Rakshitha - Maternal Healthcare Management System</p>
        <p>Government of Telangana, District Nirmal - For Official Use Only</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

export default function Reports() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(getDefaultEndDate())
  const [selectedReports, setSelectedReports] = useState<ReportType[]>(['active', 'deliveries', 'mortality'])

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getOverview,
  })

  const { data: activePatients } = useQuery({
    queryKey: ['activePatients'],
    queryFn: async () => {
      const result = await patientService.getByStatus(PatientStatus.ACTIVE, 0, 1000)
      // Filter out patients who have completed delivery (only show pending deliveries)
      return result.content.filter(p => !p.deliveryOutcome || p.deliveryOutcome === DeliveryOutcome.PENDING)
    },
  })

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: userService.getDoctors,
  })

  const { data: mortalityCases } = useQuery({
    queryKey: ['mortalityCases', startDate, endDate],
    queryFn: async () => {
      const result = await patientService.getMortalitiesByDateRange(startDate, endDate, 0, 1000)
      return result.content
    },
    enabled: !!startDate && !!endDate,
  })

  const { data: deliveries } = useQuery({
    queryKey: ['deliveries', startDate, endDate],
    queryFn: async () => {
      const result = await patientService.getDeliveriesByDateRange(startDate, endDate, 0, 1000)
      return result.content
    },
    enabled: !!startDate && !!endDate,
  })

  const handleDownloadActiveReport = async () => {
    if (!activePatients || activePatients.length === 0) {
      toast.error('No active patients to generate report')
      return
    }

    setIsGenerating(true)
    try {
      await generateActivePatientsPDF(activePatients, doctors || [], 'Active Pregnant Ladies Report')
      toast.success('Report generated! Use Ctrl+P or Cmd+P to save as PDF')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadMortalityReport = async () => {
    if (!mortalityCases || mortalityCases.length === 0) {
      toast.error('No mortality cases found in the selected date range')
      return
    }

    setIsGenerating(true)
    try {
      await generateMortalityPDF(mortalityCases, { start: startDate, end: endDate })
      toast.success('Mortality report generated! Use Ctrl+P or Cmd+P to save as PDF')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadDeliveriesReport = async () => {
    if (!deliveries || deliveries.length === 0) {
      toast.error('No deliveries found in the selected date range')
      return
    }

    setIsGenerating(true)
    try {
      await generateDeliveriesPDF(deliveries, { start: startDate, end: endDate })
      toast.success('Deliveries report generated! Use Ctrl+P or Cmd+P to save as PDF')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadComprehensiveReport = async () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report type')
      return
    }

    const hasData =
      (selectedReports.includes('active') && activePatients && activePatients.length > 0) ||
      (selectedReports.includes('deliveries') && deliveries && deliveries.length > 0) ||
      (selectedReports.includes('mortality') && mortalityCases && mortalityCases.length > 0)

    if (!hasData) {
      toast.error('No data available for the selected report types')
      return
    }

    setIsGenerating(true)
    try {
      await generateComprehensivePDF(selectedReports, {
        activePatients: activePatients || [],
        deliveries: deliveries || [],
        mortalityCases: mortalityCases || [],
        dateRange: { start: startDate, end: endDate }
      })
      toast.success('Report generated! Use Ctrl+P or Cmd+P to save as PDF')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleReportType = (type: ReportType) => {
    setSelectedReports(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const selectAllReports = () => {
    setSelectedReports(['active', 'deliveries', 'mortality'])
  }

  const riskDistribution = activePatients ? {
    red: activePatients.filter(p => p.currentRiskLevel === 'RED').length,
    yellow: activePatients.filter(p => p.currentRiskLevel === 'YELLOW').length,
    green: activePatients.filter(p => p.currentRiskLevel === 'GREEN').length,
  } : { red: 0, yellow: 0, green: 0 }

  const motherMortalityCount = mortalityCases?.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.MOTHER_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  ).length || 0

  const babyMortalityCount = mortalityCases?.filter(p =>
    p.deliveryOutcome === DeliveryOutcome.BABY_MORTALITY ||
    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
  ).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Generate and download system reports for government bodies</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader title="Date Range Filter" subtitle="Select date range for reports" />
        <CardBody>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const date = new Date()
                  date.setDate(date.getDate() - 7)
                  setStartDate(date.toISOString().split('T')[0])
                  setEndDate(new Date().toISOString().split('T')[0])
                }}
              >
                Last 7 days
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - 1)
                  setStartDate(date.toISOString().split('T')[0])
                  setEndDate(new Date().toISOString().split('T')[0])
                }}
              >
                Last 30 days
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - 3)
                  setStartDate(date.toISOString().split('T')[0])
                  setEndDate(new Date().toISOString().split('T')[0])
                }}
              >
                Last 3 months
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Download Report Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader
          title="Download Report"
          subtitle="Select report types and download comprehensive report"
        />
        <CardBody>
          <div className="space-y-4">
            {/* Report Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Report Types:</label>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedReports.length === 3 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={selectAllReports}
                >
                  All Reports
                </Button>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedReports.includes('active')
                    ? 'border-blue-500 bg-blue-100 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedReports.includes('active')}
                    onChange={() => toggleReportType('active')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <UsersIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Active Pregnant Ladies</span>
                  <Badge variant="info" className="ml-1">{activePatients?.length || 0}</Badge>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedReports.includes('deliveries')
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedReports.includes('deliveries')}
                    onChange={() => toggleReportType('deliveries')}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Deliveries</span>
                  <Badge variant="success" className="ml-1">{deliveries?.length || 0}</Badge>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedReports.includes('mortality')
                    ? 'border-red-500 bg-red-100 text-red-800'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-red-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedReports.includes('mortality')}
                    onChange={() => toggleReportType('mortality')}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <HeartIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Mortality</span>
                  <Badge variant="danger" className="ml-1">{mortalityCases?.length || 0}</Badge>
                </label>
              </div>
            </div>

            {/* Selected Report Summary */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Selected:</strong>{' '}
                {selectedReports.length === 0 ? (
                  <span className="text-red-500">No report selected</span>
                ) : selectedReports.length === 3 ? (
                  <span className="text-blue-600">All Reports (Comprehensive)</span>
                ) : (
                  selectedReports.map(type => (
                    type === 'active' ? 'Active Pregnant Ladies' :
                    type === 'deliveries' ? 'Deliveries' : 'Mortality'
                  )).join(', ')
                )}
              </p>
              <p className="text-xs text-gray-500">
                Date Range: {new Date(startDate).toLocaleDateString('en-IN')} - {new Date(endDate).toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownloadComprehensiveReport}
              loading={isGenerating}
              disabled={selectedReports.length === 0}
              className="w-full"
              size="lg"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download {selectedReports.length === 3 ? 'Comprehensive' : 'Selected'} Report
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPatients || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Successful Deliveries</p>
                <p className="text-2xl font-bold text-green-600">{stats?.successfulDeliveries || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <HeartIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mother Mortality</p>
                <p className="text-2xl font-bold text-red-600">{stats?.motherMortality || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaceSmileIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Baby Mortality</p>
                <p className="text-2xl font-bold text-red-600">{stats?.babyMortality || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Pregnant Ladies Report */}
        <Card>
          <CardHeader title="Active Pregnant Ladies Report" />
          <CardBody>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive report of all active pregnant ladies including risk levels, LMP/EDD dates.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Patients:</span>
                <span className="font-medium">{activePatients?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">High Risk:</span>
                <span className="font-medium text-red-600">{riskDistribution.red}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Moderate Risk:</span>
                <span className="font-medium text-yellow-600">{riskDistribution.yellow}</span>
              </div>
            </div>
            <Button
              onClick={handleDownloadActiveReport}
              loading={isGenerating}
              className="w-full"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download PDF Report
            </Button>
          </CardBody>
        </Card>

        {/* Deliveries Report */}
        <Card>
          <CardHeader
            title="Deliveries Report"
            action={<Badge variant="info">{deliveries?.length || 0} records</Badge>}
          />
          <CardBody>
            <p className="text-sm text-gray-600 mb-4">
              Report of all deliveries within the selected date range with mortality highlighting.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">
                  {new Date(startDate).toLocaleDateString('en-IN')} - {new Date(endDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Deliveries:</span>
                <span className="font-medium">{deliveries?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-500">Successful:</span>
                </span>
                <span className="font-medium text-green-600">
                  {deliveries?.filter(p => p.deliveryOutcome === DeliveryOutcome.SUCCESSFUL).length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-gray-500">With Mortality:</span>
                </span>
                <span className="font-medium text-red-600">
                  {deliveries?.filter(p =>
                    p.deliveryOutcome === DeliveryOutcome.MOTHER_MORTALITY ||
                    p.deliveryOutcome === DeliveryOutcome.BABY_MORTALITY ||
                    p.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY
                  ).length || 0}
                </span>
              </div>
            </div>
            <Button
              onClick={handleDownloadDeliveriesReport}
              loading={isGenerating}
              className="w-full"
              disabled={!deliveries?.length}
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download Deliveries Report
            </Button>
          </CardBody>
        </Card>

        {/* Mortality Report */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader
            title="Mortality Report"
            subtitle="For Government Bodies"
            action={<Badge variant="danger">{mortalityCases?.length || 0} cases</Badge>}
          />
          <CardBody>
            <p className="text-sm text-gray-600 mb-4">
              Detailed mortality report with patient details, contact numbers, and cause of death for government review.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">
                  {new Date(startDate).toLocaleDateString('en-IN')} - {new Date(endDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mother Mortality:</span>
                <span className="font-medium text-red-600">{motherMortalityCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Baby Mortality:</span>
                <span className="font-medium text-red-600">{babyMortalityCount}</span>
              </div>
            </div>
            <Button
              variant="danger"
              onClick={handleDownloadMortalityReport}
              loading={isGenerating}
              className="w-full"
              disabled={!mortalityCases?.length}
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download Mortality Report
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader title="Risk Distribution" subtitle="Current patient risk levels" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <RiskBadge level={RiskLevel.RED} /> Severe Risk
                </span>
                <span className="font-medium">{riskDistribution.red}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${activePatients?.length ? (riskDistribution.red / activePatients.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <RiskBadge level={RiskLevel.YELLOW} /> Moderate Risk
                </span>
                <span className="font-medium">{riskDistribution.yellow}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${activePatients?.length ? (riskDistribution.yellow / activePatients.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <RiskBadge level={RiskLevel.GREEN} /> Low Risk
                </span>
                <span className="font-medium">{riskDistribution.green}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${activePatients?.length ? (riskDistribution.green / activePatients.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* High Risk Patients */}
      <Card>
        <CardHeader title="High Risk Patients" subtitle="Patients requiring immediate attention" />
        <CardBody>
          {activePatients?.filter(p => p.currentRiskLevel === 'RED').length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePatients.filter(p => p.currentRiskLevel === 'RED').slice(0, 6).map(p => (
                <div key={p.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.motherId}</p>
                    </div>
                    <RiskBadge level={RiskLevel.RED} />
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600">
                      <span className="text-gray-500">Mobile:</span> {p.mobileNumber}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">EDD:</span>{' '}
                      {p.eddDate ? new Date(p.eddDate).toLocaleDateString('en-IN') : 'Not set'}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">Risk Score:</span> {p.currentRiskScore}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No high risk patients</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
