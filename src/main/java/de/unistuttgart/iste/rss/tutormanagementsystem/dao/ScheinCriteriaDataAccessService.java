package de.unistuttgart.iste.rss.tutormanagementsystem.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.ScheinCriteriaDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.ScheinCriteriaRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;

/**
 * ScheinCriteriaDataAccessService
 */
@Repository
public class ScheinCriteriaDataAccessService implements ScheinCriteriaDao {

    @Autowired
    private ScheinCriteriaRepository scheinCriteriaRepository;

    @Override
    public ScheinCriteria getCriteria(final UUID id) throws ElementNotFoundException {
        Optional<ScheinCriteria> criteria = scheinCriteriaRepository.findById(id);

        if (criteria.isEmpty()) {
            throw new ElementNotFoundException();
        }

        return criteria.get();
    }

    @Override
    public List<ScheinCriteria> getAllCriterias() {
        return scheinCriteriaRepository.findAll();
    }

    @Override
    public ScheinCriteria saveCriteria(final ScheinCriteria criteria) {
        return scheinCriteriaRepository.save(criteria);
    }

    @Override
    public void deleteCriteria(final UUID id) throws ElementNotFoundException {
        try {
            scheinCriteriaRepository.deleteById(id);

        } catch (EmptyResultDataAccessException e) {
            throw new ElementNotFoundException();
        }
    }

    public boolean hasCriteria(final UUID id) {
        return scheinCriteriaRepository.existsById(id);
    }
}
