package com.ammarakshitha.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaUpdater implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) {
        String databaseProduct = getDatabaseProductName();
        if (databaseProduct == null) {
            return;
        }

        if (databaseProduct.contains("H2")) {
            runDdl("ALTER TABLE patients ALTER COLUMN aadhaar_number SET NULL");
            runDdl("ALTER TABLE patients ALTER COLUMN aadhaar_number DROP NOT NULL");
        } else if (databaseProduct.contains("PostgreSQL")) {
            runDdl("ALTER TABLE patients ALTER COLUMN aadhaar_number DROP NOT NULL");
        } else {
            log.debug("Skipping Aadhaar nullable migration for unsupported DB: {}", databaseProduct);
        }

        // Fix photo URLs to include /api prefix
        fixPhotoUrls();
    }

    private void fixPhotoUrls() {
        // Update health_checks photo_url to include /api prefix
        int healthChecksUpdated = runUpdate(
            "UPDATE health_checks SET photo_url = CONCAT('/api', photo_url) " +
            "WHERE photo_url IS NOT NULL AND photo_url LIKE '/uploads/%' AND photo_url NOT LIKE '/api/%'"
        );
        if (healthChecksUpdated > 0) {
            log.info("Updated {} health check photo URLs to include /api prefix", healthChecksUpdated);
        }

        // Update follow_ups photo_url to include /api prefix
        int followUpsUpdated = runUpdate(
            "UPDATE follow_ups SET photo_url = CONCAT('/api', photo_url) " +
            "WHERE photo_url IS NOT NULL AND photo_url LIKE '/uploads/%' AND photo_url NOT LIKE '/api/%'"
        );
        if (followUpsUpdated > 0) {
            log.info("Updated {} follow-up photo URLs to include /api prefix", followUpsUpdated);
        }
    }

    private int runUpdate(String sql) {
        try {
            return jdbcTemplate.update(sql);
        } catch (Exception ex) {
            log.debug("Update skipped or failed: {}", sql, ex);
            return 0;
        }
    }

    private String getDatabaseProductName() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            return metaData.getDatabaseProductName();
        } catch (Exception ex) {
            log.debug("Unable to determine database product name", ex);
            return null;
        }
    }

    private void runDdl(String ddl) {
        try {
            jdbcTemplate.execute(ddl);
        } catch (Exception ex) {
            log.debug("DDL skipped or failed: {}", ddl, ex);
        }
    }
}
