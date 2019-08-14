package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import lombok.Getter;

/**
 * Abstract representation of the data of a form field. It just holds the type in form of a
 * {@link FormFieldType} of this field.
 */
@Getter
public abstract class FormFieldData {

    @Enumerated(EnumType.STRING)
    private final FormFieldType type;

    public FormFieldData(FormFieldType type) {
        this.type = type;
    }

}
