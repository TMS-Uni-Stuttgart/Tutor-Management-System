package de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * ExceptionDTO
 */
@Getter
@AllArgsConstructor
public class ExceptionDTO {

    private final int status;
    private final String message;

}
