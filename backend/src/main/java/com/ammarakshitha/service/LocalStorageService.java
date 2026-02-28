package com.ammarakshitha.service;

import com.ammarakshitha.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageService implements StorageService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = generateFileName(file.getOriginalFilename());
            Path filePath = uploadPath.resolve(fileName);

            // Copy file to the target location
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String url = String.format("/uploads/%s/%s", folder, fileName);
            log.info("File uploaded successfully to local storage: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Failed to upload file to local storage", e);
            throw new BusinessException("Failed to upload file");
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return;
            }

            // Extract file path from URL (/uploads/folder/filename)
            String relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            Path filePath = Paths.get(relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully from local storage: {}", fileUrl);
            }
        } catch (Exception e) {
            // Don't fail if old file doesn't exist or can't be deleted
            log.warn("Failed to delete file from local storage: {}", fileUrl, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds maximum limit of 5MB");
        }

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("Only JPG, JPEG, and PNG images are allowed");
        }
    }

    private String generateFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}
