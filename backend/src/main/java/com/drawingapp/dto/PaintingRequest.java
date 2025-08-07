package com.drawingapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PaintingRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Shapes are required")
    private List<Object> shapes;

    public PaintingRequest() {
    }

    public PaintingRequest(String name, List<Object> shapes) {
        this.name = name;
        this.shapes = shapes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Object> getShapes() {
        return shapes;
    }

    public void setShapes(List<Object> shapes) {
        this.shapes = shapes;
    }
}
