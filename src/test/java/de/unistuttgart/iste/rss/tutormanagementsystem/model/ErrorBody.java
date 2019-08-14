package de.unistuttgart.iste.rss.tutormanagementsystem.model;

import lombok.Getter;

/**
 * ErrorBody
 */
@Getter
public class ErrorBody {

    private String timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

}
