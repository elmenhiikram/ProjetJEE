package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Client;
import com.gestionVentesBackend.Repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Clients
 */
@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public Optional<Client> getClientByEmail(String email) {
        return clientRepository.findByEmail(email);
    }

    public Client createClient(Client client) {
        return clientRepository.save(client);
    }

    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        
        // Les champs hérités de Personne peuvent être mis à jour ici
        if (clientDetails.getNom() != null) client.setNom(clientDetails.getNom());
        if (clientDetails.getPrenom() != null) client.setPrenom(clientDetails.getPrenom());
        if (clientDetails.getEmail() != null) client.setEmail(clientDetails.getEmail());
        if (clientDetails.getNumeroTel() != null) client.setNumeroTel(clientDetails.getNumeroTel());
        if (clientDetails.getAddress() != null) client.setAddress(clientDetails.getAddress());
        if (clientDetails.getPhotoUrl() != null) client.setPhotoUrl(clientDetails.getPhotoUrl());
        if (clientDetails.getPassword() != null) client.setPassword(clientDetails.getPassword());
        
        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client non trouvé avec l'ID: " + id);
        }
        try {
            clientRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Impossible de supprimer le client. Il peut avoir des ventes associées: " + e.getMessage());
        }
    }
}
