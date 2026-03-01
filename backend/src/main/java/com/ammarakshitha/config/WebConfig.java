package com.ammarakshitha.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created uploads directory: {}", uploadPath);
            }
            log.info("Serving static files from: {}", uploadPath);
        } catch (Exception e) {
            log.error("Failed to create uploads directory", e);
        }
    }

    // Resource handler disabled - using FileController instead
    // @Override
    // public void addResourceHandlers(ResourceHandlerRegistry registry) {
    //     Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    //     String uploadLocation = "file:" + uploadPath.toString().replace("\\", "/") + "/";
    //     log.info("Configuring resource handler for /uploads/** -> {}", uploadLocation);
    //     registry.addResourceHandler("/uploads/**")
    //             .addResourceLocations(uploadLocation)
    //             .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());
    // }
}
