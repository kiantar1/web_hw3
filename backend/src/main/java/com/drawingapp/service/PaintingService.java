package com.drawingapp.service;

import com.drawingapp.dto.PaintingRequest;
import com.drawingapp.dto.PaintingResponse;
import com.drawingapp.entity.Painting;
import com.drawingapp.entity.User;
import com.drawingapp.repository.PaintingRepository;
import com.drawingapp.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaintingService {

    @Autowired
    private PaintingRepository paintingRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<PaintingResponse> getUserPaintings(Long userId) {
        List<Painting> paintings = paintingRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return paintings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PaintingResponse getPainting(Long paintingId, Long userId) {
        Painting painting = paintingRepository.findByIdAndUserId(paintingId, userId)
                .orElseThrow(() -> new RuntimeException("Painting not found"));
        return convertToResponse(painting);
    }

    public PaintingResponse createPainting(Long userId, PaintingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            String shapesJson = objectMapper.writeValueAsString(request.getShapes());
            Painting painting = new Painting(request.getName(), user, shapesJson);
            painting = paintingRepository.save(painting);
            return convertToResponse(painting);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing shapes data");
        }
    }

    public PaintingResponse updatePainting(Long paintingId, Long userId, PaintingRequest request) {
        Painting painting = paintingRepository.findByIdAndUserId(paintingId, userId)
                .orElseThrow(() -> new RuntimeException("Painting not found"));

        try {
            String shapesJson = objectMapper.writeValueAsString(request.getShapes());
            painting.setName(request.getName());
            painting.setShapes(shapesJson);
            painting = paintingRepository.save(painting);
            return convertToResponse(painting);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing shapes data");
        }
    }

    @Transactional
    public void deletePainting(Long paintingId, Long userId) {
        if (!paintingRepository.findByIdAndUserId(paintingId, userId).isPresent()) {
            throw new RuntimeException("Painting not found");
        }
        paintingRepository.deleteByIdAndUserId(paintingId, userId);
    }

    private PaintingResponse convertToResponse(Painting painting) {
        try {
            List<Object> shapes = objectMapper.readValue(painting.getShapes(), new TypeReference<List<Object>>() {
            });
            return new PaintingResponse(
                    painting.getId(),
                    painting.getName(),
                    shapes,
                    painting.getCreatedAt(),
                    painting.getUpdatedAt());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing shapes data");
        }
    }
}
