package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;

/**
 * Marks a field within a {@link IsScheinCriteria} class to be ignored by the parser. Fields ignored
 * this way won't be added to the {@link ScheinCriteriaForm}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface ScheinCriteriaIgnore {
}
