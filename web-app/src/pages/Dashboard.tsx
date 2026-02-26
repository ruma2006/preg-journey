import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  BellAlertIcon,
  CheckCircleIcon,
  HeartIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardBody, StatsCard, RiskBadge, Badge, SkeletonDashboard } from '@/components/ui'
import { dashboardService, patientService, alertService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { RiskLevel, DeliveryOutcome } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const RISK_COLORS = {
  [RiskLevel.RED]: '#dc2626',
  [RiskLevel.YELLOW]: '#f59e0b',
  [RiskLevel.GREEN]: '#16a34a',
}

type DashboardTab = 'overview' | 'deliveries' | 'mortality'

// Custom active shape renderer for pie chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#374151" className="text-lg font-bold">
        {value}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#6b7280" className="text-xs">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.3}
      />
    </g>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [activePieIndex, setActivePieIndex] = useState(0)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getOverview,
  })

  const { data: highRiskPatients, isLoading: patientsLoading } = useQuery({
    queryKey: ['highRiskPatients'],
    queryFn: patientService.getHighRisk,
  })

  const { data: criticalAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['criticalAlerts'],
    queryFn: alertService.getCritical,
  })

  const { data: successfulDeliveries } = useQuery({
    queryKey: ['successfulDeliveries'],
    queryFn: () => patientService.getSuccessfulDeliveries(0, 10),
    enabled: activeTab === 'deliveries',
  })

  const { data: motherMortalityCases } = useQuery({
    queryKey: ['motherMortalityCases'],
    queryFn: () => patientService.getMotherMortalityCases(0, 10),
    enabled: activeTab === 'mortality',
  })

  const { data: babyMortalityCases } = useQuery({
    queryKey: ['babyMortalityCases'],
    queryFn: () => patientService.getBabyMortalityCases(0, 10),
    enabled: activeTab === 'mortality',
  })

  if (statsLoading) {
    return <SkeletonDashboard />
  }

  const riskData = [
    { name: 'Severe (RED)', value: stats?.highRiskPatients || 0, color: RISK_COLORS[RiskLevel.RED], riskLevel: RiskLevel.RED },
    { name: 'Moderate (YELLOW)', value: stats?.moderateRiskPatients || 0, color: RISK_COLORS[RiskLevel.YELLOW], riskLevel: RiskLevel.YELLOW },
    { name: 'Stable (GREEN)', value: stats?.stablePatients || 0, color: RISK_COLORS[RiskLevel.GREEN], riskLevel: RiskLevel.GREEN },
  ]

  // Activity data for bar chart
  const activityData = [
    { name: 'Health Checks', today: stats?.healthChecksToday || 0, month: stats?.healthChecksThisMonth || 0 },
    { name: 'Follow-ups', today: stats?.followUpsCompleted || 0, pending: stats?.followUpsToday || 0 },
    { name: 'Consultations', today: stats?.consultationsToday || 0, upcoming: stats?.upcomingConsultations || 0 },
  ]

  const handlePieClick = (_data: any, index: number) => {
    const riskLevel = riskData[index]?.riskLevel
    if (riskLevel) {
      navigate(`/patients?risk=${riskLevel}`)
    }
  }

  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-primary-100 mt-1">
          Here's an overview of today's activities in Amma Rakshitha
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'deliveries'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircleIcon className="h-5 w-5" />
            Successful Deliveries
            <Badge variant="success">{stats?.successfulDeliveries || 0}</Badge>
          </button>
          <button
            onClick={() => setActiveTab('mortality')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'mortality'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <HeartIcon className="h-5 w-5" />
            Mortality Records
            {((stats?.motherMortality || 0) + (stats?.babyMortality || 0)) > 0 && (
              <Badge variant="danger">{(stats?.motherMortality || 0) + (stats?.babyMortality || 0)}</Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Active Patients"
              value={stats?.activePatients || 0}
              icon={<UserGroupIcon className="h-6 w-6" />}
              color="blue"
              onClick={() => navigate('/patients')}
            />
            <StatsCard
              title="High Risk Patients"
              value={stats?.highRiskPatients || 0}
              icon={<ExclamationTriangleIcon className="h-6 w-6" />}
              color="red"
              onClick={() => navigate('/patients?risk=RED')}
            />
            <StatsCard
              title="Health Checks Today"
              value={stats?.healthChecksToday || 0}
              icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
              color="green"
              onClick={() => navigate('/health-checks')}
            />
            <StatsCard
              title="Pending Follow-ups"
              value={stats?.followUpsToday || 0}
              icon={<PhoneIcon className="h-6 w-6" />}
              color="yellow"
              onClick={() => navigate('/follow-ups')}
            />
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Successful Deliveries"
              value={stats?.successfulDeliveries || 0}
              icon={<CheckCircleIcon className="h-6 w-6" />}
              color="green"
              onClick={() => setActiveTab('deliveries')}
            />
            <StatsCard
              title="Mother Mortality"
              value={stats?.motherMortality || 0}
              icon={<HeartIcon className="h-6 w-6" />}
              color="red"
              onClick={() => setActiveTab('mortality')}
            />
            <StatsCard
              title="Baby Mortality"
              value={stats?.babyMortality || 0}
              icon={<FaceSmileIcon className="h-6 w-6" />}
              color="red"
              onClick={() => setActiveTab('mortality')}
            />
            <StatsCard
              title="Critical Alerts"
              value={stats?.criticalAlerts || 0}
              icon={<BellAlertIcon className="h-6 w-6" />}
              color="red"
              onClick={() => navigate('/alerts')}
            />
          </div>
        </>
      )}

      {/* Charts and Lists - Overview */}
      {activeTab === 'overview' && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart - Interactive */}
        <Card hover>
          <CardHeader
            title="Risk Distribution"
            subtitle="Click a segment to view patients"
          />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onClick={handlePieClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {riskData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{
                          transition: 'all 0.3s ease',
                          filter: index === activePieIndex ? 'brightness(1.1)' : 'none'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} patients`, '']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {riskData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(`/patients?risk=${item.riskLevel}`)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name.split(' ')[0]}</span>
                  <span className="text-sm text-gray-500">({item.value})</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* High Risk Patients */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="High Risk Patients"
            subtitle="Patients requiring immediate attention"
            action={
              <button
                onClick={() => navigate('/patients?risk=RED')}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </button>
            }
          />
          <CardBody className="p-0">
            {patientsLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : highRiskPatients && highRiskPatients.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {highRiskPatients.slice(0, 5).map((patient) => (
                  <div
                    key={patient.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        Mother ID: {patient.motherId} | Age: {patient.age}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <RiskBadge level={patient.currentRiskLevel} />
                      <span className="text-sm text-gray-500">
                        Score: {patient.currentRiskScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No high risk patients at the moment
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card hover>
        <CardHeader
          title="Activity Overview"
          subtitle="Today's activities and pending work"
        />
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
                <Bar
                  dataKey="today"
                  name="Completed Today"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="month"
                  name="This Month"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="upcoming"
                  name="Upcoming"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Critical Alerts */}
      <Card>
        <CardHeader
          title="Critical Alerts"
          subtitle="Alerts requiring immediate action"
          action={
            <button
              onClick={() => navigate('/alerts')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all alerts
            </button>
          }
        />
        <CardBody className="p-0">
          {alertsLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : criticalAlerts && criticalAlerts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {criticalAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-500">
                          Patient: {alert.patient.name} | {alert.patient.motherId}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No critical alerts at the moment
            </div>
          )}
        </CardBody>
      </Card>
      </>
      )}

      {/* Deliveries Tab Content */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Successful Deliveries"
              value={stats?.successfulDeliveries || 0}
              icon={<CheckCircleIcon className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Active Patients"
              value={stats?.activePatients || 0}
              icon={<UserGroupIcon className="h-6 w-6" />}
              color="blue"
            />
            <StatsCard
              title="Delivery Rate"
              value={`${stats?.totalPatients ? ((stats.successfulDeliveries / stats.totalPatients) * 100).toFixed(1) : 0}%`}
              icon={<CheckCircleIcon className="h-6 w-6" />}
              color="green"
            />
          </div>

          <Card>
            <CardHeader
              title="Successful Deliveries"
              subtitle="All patients with completed deliveries"
              action={
                <button
                  onClick={() => navigate('/reports')}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View Reports
                </button>
              }
            />
            <CardBody className="p-0">
              {successfulDeliveries && successfulDeliveries.content.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {successfulDeliveries.content.map((patient) => (
                    <div
                      key={patient.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">
                            Mother ID: {patient.motherId} | Mobile: {patient.mobileNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="success">
                            {patient.deliveryType || 'Delivered'}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {patient.deliveryDate && new Date(patient.deliveryDate).toLocaleDateString('en-IN')}
                          </p>
                          {patient.babyGender && (
                            <p className="text-xs text-gray-400">
                              Baby: {patient.babyGender} {patient.babyWeight ? `(${patient.babyWeight} kg)` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No successful deliveries recorded yet
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Mortality Tab Content */}
      {activeTab === 'mortality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              title="Mother Mortality"
              value={stats?.motherMortality || 0}
              icon={<HeartIcon className="h-6 w-6" />}
              color="red"
            />
            <StatsCard
              title="Baby Mortality"
              value={stats?.babyMortality || 0}
              icon={<FaceSmileIcon className="h-6 w-6" />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mother Mortality Cases */}
            <Card>
              <CardHeader
                title="Mother Mortality Cases"
                subtitle="Records of maternal mortality"
              />
              <CardBody className="p-0">
                {motherMortalityCases && motherMortalityCases.content.length > 0 ? (
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {motherMortalityCases.content.map((patient) => (
                      <div
                        key={patient.id}
                        className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-500">
                              Mother ID: {patient.motherId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Mobile: {patient.mobileNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="danger">
                              {patient.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY ? 'Both' : 'Mother'}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              {patient.mortalityDate && new Date(patient.mortalityDate).toLocaleDateString('en-IN')}
                            </p>
                            {patient.mortalityCause && (
                              <p className="text-xs text-red-500 mt-1 max-w-32 truncate">
                                {patient.mortalityCause}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No mother mortality cases recorded
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Baby Mortality Cases */}
            <Card>
              <CardHeader
                title="Baby Mortality Cases"
                subtitle="Records of infant mortality"
              />
              <CardBody className="p-0">
                {babyMortalityCases && babyMortalityCases.content.length > 0 ? (
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {babyMortalityCases.content.map((patient) => (
                      <div
                        key={patient.id}
                        className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-500">
                              Mother ID: {patient.motherId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Mobile: {patient.mobileNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="danger">
                              {patient.deliveryOutcome === DeliveryOutcome.BOTH_MORTALITY ? 'Both' : 'Baby'}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              {patient.mortalityDate && new Date(patient.mortalityDate).toLocaleDateString('en-IN')}
                            </p>
                            {patient.mortalityCause && (
                              <p className="text-xs text-red-500 mt-1 max-w-32 truncate">
                                {patient.mortalityCause}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No baby mortality cases recorded
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 text-center">
                For detailed mortality reports with patient contact information and consultation history,
                please visit the <button onClick={() => navigate('/reports')} className="text-primary-600 hover:underline">Reports</button> section.
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
