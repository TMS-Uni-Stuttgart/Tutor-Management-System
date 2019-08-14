package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;

/**
 * Can be used to declare a number as percentage in a {@link IsScheinCriteria} class. The
 * configuration will be added to the corresponding entry on the {@link ScheinCriteriaForm} aswell.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface ScheinCriteriaPercentage {
}
