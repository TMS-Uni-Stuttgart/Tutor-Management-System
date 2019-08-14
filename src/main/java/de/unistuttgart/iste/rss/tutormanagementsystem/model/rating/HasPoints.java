package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import java.util.Optional;

/**
 * Sets objects of classes which implement this interface to be able to save points.
 */
public interface HasPoints {

    /**
     * Saves the points for the given sheet and it's exercise.
     * 
     * @param sheet Sheet which belongs to the points.
     * @param exercise Exercise of that sheet which belongs to the points.
     * @param points Points to save.
     */
    public void setPoints(final Sheet sheet, final Exercise exercise, final double points);

    /**
     * Checks if there are points saved for the given {@link Sheet} and {@link Exercise}.
     * 
     * @param sheet Sheet to check.
     * @param exercise Exercise (on that sheet) to check.
     * @return Does the entity contain points for the given sheet & exercise?
     */
    public boolean hasPoints(final Sheet sheet, final Exercise exercise);

    /**
     * Returns the points saved for the given {@link Sheet} and {@link Exercise}. <br />
     * Tries to get the points saved for the given combination of {@link Sheet} and
     * {@link Exercise}. If there are no points saved the returned {@link Optional} will be empty.
     * 
     * @param sheet Sheet which belongs to the points.
     * @param exercise Exercise which belongs to the points.
     * @return Points saved for the given Sheet & Exercise. Empty if there are no points saved.
     */
    public Optional<Double> getPoints(final Sheet sheet, final Exercise exercise);
}
