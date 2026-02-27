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
