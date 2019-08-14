package de.unistuttgart.iste.rss.tutormanagementsystem.dao.model;

import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;

/**
 * SheetDao
 */
public interface SheetDao {

    public List<Sheet> getAllSheets();

    public Sheet saveSheet(final Sheet sheet);

    public void deleteSheet(final UUID id) throws ElementNotFoundException;

    public Sheet getSheet(final UUID id) throws ElementNotFoundException;

}
