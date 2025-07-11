package com.example.tour_backend.controller;

import com.example.tour_backend.domain.traffic.Traffic;
import com.example.tour_backend.domain.traffic.TrafficRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api/traffics")
@RequiredArgsConstructor
public class TrafficController {

    private final TrafficRepository trafficRepository;

    @GetMapping
    public List<Traffic> getAll() {
        return trafficRepository.findAll();
    }

    @GetMapping("/{id}")
    public Traffic getById(@PathVariable Long id) {
        return trafficRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Traffic not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Traffic create(@RequestBody Traffic traffic) {
//        Timestamp now = new Timestamp(System.currentTimeMillis());
//        traffic.setCreateDate(now);
//        traffic.setModifiedDate(now);
        return trafficRepository.save(traffic);
    }

    @PutMapping("/{id}")
    public Traffic update(@PathVariable Long id, @RequestBody Traffic updated) {
        return trafficRepository.findById(id).map(t -> {
            t.setVehicle(updated.getVehicle());
            t.setSpendTime(updated.getSpendTime());
            t.setPrice(updated.getPrice());
//            t.setModifiedDate(new Timestamp(System.currentTimeMillis()));
            return trafficRepository.save(t);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Traffic not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        trafficRepository.deleteById(id);
    }
}
