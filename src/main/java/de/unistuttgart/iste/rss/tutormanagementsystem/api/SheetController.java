package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.util.List;
import java.util.UUID;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.SheetDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.SheetService;

/**
 * SheetController
 */
@RestController
@RequestMapping(path = "/api/sheet")
@ResponseBody
public class SheetController {

    @Autowired
    private SheetService sheetService;

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public Sheet createSheet(@RequestBody @Valid SheetDTO sheetDTO) {
        return sheetService.createSheet(sheetDTO);
    }

    @GetMapping
    public List<Sheet> getAllSheets() {
        return sheetService.getAllSheets();
    }

    @GetMapping(path = "{id}")
    public Sheet getSheet(@PathVariable UUID id) throws ElementNotFoundException {
        return sheetService.getSheet(id);
    }

    @PatchMapping(path = "{id}")
    public Sheet patchSheet(@PathVariable UUID id, @RequestBody SheetDTO sheetDto)
            throws ElementNotFoundException {
        return sheetService.updateSheet(id, sheetDto);
    }

    @DeleteMapping(path = "{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteSheet(@PathVariable UUID id) throws ElementNotFoundException {
        sheetService.deleteSheet(id);
    }
}
