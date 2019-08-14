package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;

/**
 * Can be used to further configure a number in a {@link IsScheinCriteria} class. The configuration
 * will be added to the corresponding entry on the {@link ScheinCriteriaForm} aswell.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface ScheinCriteriaNumber {

    /**
     * Minimal value of the number allowed.
     */
    double min() default Integer.MIN_VALUE;

    /**
     * Maximal value of the number allowed.
     */
    double max() default Integer.MAX_VALUE;

    // double step() default 1;
}
