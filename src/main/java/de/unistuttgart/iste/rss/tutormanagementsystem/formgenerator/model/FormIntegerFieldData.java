package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model;

import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaNumber;
import lombok.Getter;

/**
 * Configures the {@link FormFieldData} to be {@code FormFieldType.INTEGER}. This also holds the
 * possible configuration from {@link ScheinCriteriaNumber}.
 */
@Getter
public class FormIntegerFieldData extends FormFieldData {

    private final int min;
    private final int max;

    public FormIntegerFieldData() {
        this(Integer.MIN_VALUE, Integer.MAX_VALUE);
    }

    public FormIntegerFieldData(int min, int max) {
        super(FormFieldType.INTEGER);

        this.min = min;
        this.max = max;
    }

}
