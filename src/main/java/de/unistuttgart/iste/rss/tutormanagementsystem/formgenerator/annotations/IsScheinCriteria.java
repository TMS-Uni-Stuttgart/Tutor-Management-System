package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;

/**
 * Marks a class to be handled as a "ScheinCriteria". There has to be an unique {@code identifer}
 * for each of these classes.
 * 
 * <p>
 * All classes marked this way will get picked up on server start and parsed to a format which
 * allows a dynamic communication between client and server. Every class will get a
 * {@link ScheinCriteriaForm} which contains all important information. These information are used
 * to parse certain requests to the server.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface IsScheinCriteria {

    /**
     * Unique identifier of this criteria.
     */
    String identifier();
}
