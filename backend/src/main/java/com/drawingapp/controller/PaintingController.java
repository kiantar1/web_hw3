package com.drawingapp.controller;

import com.drawingapp.dto.PaintingRequest;
import com.drawingapp.dto.PaintingResponse;
import com.drawingapp.service.PaintingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paintings")
@CrossOrigin(origins = "http://localhost:3000")
public class PaintingController {

    @Autowired
    private PaintingService paintingService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<PaintingResponse>> getUserPaintings(@PathVariable Long userId) {
        List<PaintingResponse> paintings = paintingService.getUserPaintings(userId);
        return ResponseEntity.ok(paintings);
    }

    @GetMapping("/{userId}/{paintingId}")
    public ResponseEntity<PaintingResponse> getPainting(@PathVariable Long userId,
            @PathVariable Long paintingId) {
        try {
            PaintingResponse painting = paintingService.getPainting(paintingId, userId);
            return ResponseEntity.ok(painting);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> createPainting(@PathVariable Long userId,
            @Valid @RequestBody PaintingRequest request) {
        try {
            PaintingResponse painting = paintingService.createPainting(userId, request);
            Map<String, Object> response = new HashMap<>();
            response.put("id", painting.getId());
            response.put("name", painting.getName());
            response.put("shapes", painting.getShapes());
            response.put("message", "Painting saved successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{userId}/{paintingId}")
    public ResponseEntity<Map<String, Object>> updatePainting(@PathVariable Long userId,
            @PathVariable Long paintingId,
            @Valid @RequestBody PaintingRequest request) {
        try {
            PaintingResponse painting = paintingService.updatePainting(paintingId, userId, request);
            Map<String, Object> response = new HashMap<>();
            response.put("id", painting.getId());
            response.put("name", painting.getName());
            response.put("shapes", painting.getShapes());
            response.put("message", "Painting updated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{userId}/{paintingId}")
    public ResponseEntity<Map<String, String>> deletePainting(@PathVariable Long userId,
            @PathVariable Long paintingId) {
        try {
            paintingService.deletePainting(paintingId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Painting deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
