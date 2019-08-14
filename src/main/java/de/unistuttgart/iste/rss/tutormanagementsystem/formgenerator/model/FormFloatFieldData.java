package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model;

import java.util.Optional;
import org.springframework.lang.Nullable;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaNumber;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaPossiblePercentage;
import lombok.Getter;

/**
 * Configures the {@link FormFieldData} to be {@code FormFieldType.FLOAT}. This also holds the
 * possible configurations from {@link ScheinCriteriaNumber} and
 * {@link ScheinCriteriaPossiblePercentage}.
 */
@Getter
public class FormFloatFieldData extends FormFieldData {

    private final double min;
    private final double max;
    private final Optional<String> percentageToggleField;
    private final boolean percentage;

    public FormFloatFieldData() {
        this(Integer.MIN_VALUE, Integer.MAX_VALUE);
    }

    public FormFloatFieldData(final String percentageToggleField) {
        this(Integer.MIN_VALUE, Integer.MAX_VALUE, percentageToggleField, false);
    }

    public FormFloatFieldData(final double min, final double max) {
        this(min, max, null, false);
    }

    public FormFloatFieldData(final double min, final double max,
            final @Nullable String percentageToggleField, final boolean percentage) {
        super(FormFieldType.FLOAT);

        this.min = min;
        this.max = max;
        this.percentageToggleField = Optional.ofNullable(percentageToggleField);
        this.percentage = percentage;
    }
}
