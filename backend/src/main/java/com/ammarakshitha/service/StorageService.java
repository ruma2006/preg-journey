package com.ammarakshitha.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    
    /**
     * Upload a file to storage
     * @param file the file to upload
     * @param folder the folder/prefix to store the file in
     * @return the URL or path to access the uploaded file
     */
    String uploadFile(MultipartFile file, String folder);
    
    /**
     * Delete a file from storage
     * @param fileUrl the URL or path of the file to delete
     */
    void deleteFile(String fileUrl);
}
