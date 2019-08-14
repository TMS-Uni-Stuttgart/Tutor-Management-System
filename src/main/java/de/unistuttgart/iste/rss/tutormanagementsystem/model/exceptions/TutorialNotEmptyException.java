package de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import lombok.Getter;

/**
 * Exception indicating that an empty tutorial was expected but a non empty was found. Response code
 * is BAD_REQUEST (400).
 */
@Getter
@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Tutorial was not empty.")
public class TutorialNotEmptyException extends Exception {

    private static final long serialVersionUID = 1L;

    private String message;

    public TutorialNotEmptyException(final String message) {
        this.message = message;
    }

}
