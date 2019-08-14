package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;

/**
 * Configures the {@link FormFieldData} to be {@code FormFieldType.ENUM}. This also holds a list of
 * all values the enum can be as a list of {@link FormSelectValue}.
 * 
 * @param <E> Type of the enum.
 */
@Getter
public class FormEnumFieldData<E> extends FormFieldData {

    private final List<FormSelectValue<E>> enumValues;

    public FormEnumFieldData(final List<FormSelectValue<E>> enumValues) {
        super(FormFieldType.ENUM);

        this.enumValues = new ArrayList<>(enumValues);
    }

}
