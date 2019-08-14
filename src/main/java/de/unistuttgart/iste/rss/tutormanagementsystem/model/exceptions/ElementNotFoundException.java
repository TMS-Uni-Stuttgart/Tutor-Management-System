package de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown Exception when a ressource is not found on the server side. It returns 200 with a body
 * that contains information on the error.
 */
@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Element was not found on the server.")
public class ElementNotFoundException extends Exception {

    private static final long serialVersionUID = 1L;

    public ElementNotFoundException() {}

    public ElementNotFoundException(final String message) {
        super(message);
    }

}
