package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.ScheinCriteriaDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;

/**
 * ScheinCriteriaService
 */
@Service
public class ScheinCriteriaService {

    @Autowired
    private ScheinCriteriaDao scheinCriteriaDao;

    public ScheinCriteria getCriteria(final UUID id) throws ElementNotFoundException {
        return scheinCriteriaDao.getCriteria(id);
    }

    public ScheinCriteria createCriteria(final ScheinCriteria criteria) {
        criteria.setId(UUID.randomUUID());

        return scheinCriteriaDao.saveCriteria(criteria);
    }

    public void deleteCriteria(final UUID id) throws ElementNotFoundException {
        scheinCriteriaDao.deleteCriteria(id);
    }

    public List<ScheinCriteria> getAllCriterias() {
        return scheinCriteriaDao.getAllCriterias();
    }

    public ScheinCriteria replaceCriteria(final UUID id, final ScheinCriteria updatedCriteria)
            throws ElementNotFoundException {
        if (!scheinCriteriaDao.hasCriteria(id)) {
            throw new ElementNotFoundException();
        }

        updatedCriteria.setId(id);
        scheinCriteriaDao.deleteCriteria(id);

        return scheinCriteriaDao.saveCriteria(updatedCriteria);
    }
}
