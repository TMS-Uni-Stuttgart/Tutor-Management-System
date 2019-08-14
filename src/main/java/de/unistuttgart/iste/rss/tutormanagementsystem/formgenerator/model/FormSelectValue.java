package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model;

import lombok.Getter;

/**
 * Contains the information about a form value which is part of a selectable list. The String
 * identifier needs to be unique relative to the containing list.
 * 
 * @param <T> Type of the value contained.
 */
@Getter
public class FormSelectValue<T> {
    private final String identifier;
    private final T value;

    public FormSelectValue(final String identifier, final T value) {
        this.identifier = identifier;
        this.value = value;
    }

}
