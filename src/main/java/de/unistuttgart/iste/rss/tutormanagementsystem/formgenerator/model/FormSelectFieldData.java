package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;

/**
 * Configures the {@link FormFieldData} to be {@code FormFieldType.SELECT}. This holds a list of
 * {@link FormSelectValue} which contain the information about the values which are selectable.
 * 
 * @param <T> Type of the values which are selectable.
 */
@Getter
public class FormSelectFieldData<T> extends FormFieldData {

    private final List<FormSelectValue<T>> values;

    public FormSelectFieldData(final List<FormSelectValue<T>> values) {
        super(FormFieldType.SELECT);

        this.values = new ArrayList<>(values);
    }

}
