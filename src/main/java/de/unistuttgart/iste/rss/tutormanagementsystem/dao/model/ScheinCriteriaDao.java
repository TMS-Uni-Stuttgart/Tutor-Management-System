package de.unistuttgart.iste.rss.tutormanagementsystem.dao.model;

import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;

/**
 * ScheinCriteriaDao
 */
public interface ScheinCriteriaDao {

    public ScheinCriteria getCriteria(final UUID id) throws ElementNotFoundException;

    public List<ScheinCriteria> getAllCriterias();

    public ScheinCriteria saveCriteria(final ScheinCriteria criteria);

    public void deleteCriteria(final UUID id) throws ElementNotFoundException;

    public boolean hasCriteria(final UUID id);
}
