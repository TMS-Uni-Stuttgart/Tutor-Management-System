package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;

/**
 * Marks a field as a possible percentage field. This means it can hold a percentage OR just a
 * normal value. If the field holds a percentage is set by the attribute with the name provided by
 * {@code toggledBy}. This toggle boolean field has to be within the class or within one of it's
 * parents and accessible.
 * 
 * <p>
 * Furthermore, this annotation will configure the corresponding field in the
 * {@link ScheinCriteriaForm} to have that information aswell.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface ScheinCriteriaPossiblePercentage {

    /**
     * Name of the boolean field which toggles if this field holds a percentage value or not. It has
     * to be within the same class or accessible in one of it's parents.
     */
    String toggledBy();
}
