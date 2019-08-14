package de.unistuttgart.iste.rss.tutormanagementsystem.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.SheetDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.SheetRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;

/**
 * SheetDataAccessService
 */
@Repository
public class SheetDataAccessService implements SheetDao {

    @Autowired
    private SheetRepository sheetRepository;

    @Override
    public List<Sheet> getAllSheets() {
        return sheetRepository.findAllByOrderBySheetNoAsc();
    }

    @Override
    public Sheet getSheet(final UUID id) throws ElementNotFoundException {
        Optional<Sheet> sheet = sheetRepository.findById(id);

        if (sheet.isEmpty()) {
            throw new ElementNotFoundException();
        }

        return sheet.get();
    }

    @Override
    public Sheet saveSheet(final Sheet sheet) {
        return sheetRepository.save(sheet);
    }

    @Override
    public void deleteSheet(UUID id) throws ElementNotFoundException {
        try {
            sheetRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new ElementNotFoundException();
        }
    }
}
