package com.gestionVentesBackend.Repository;

<<<<<<< HEAD
import com.gestionVentesBackend.Model.Categorie;
=======
>>>>>>> 8d1c0e206745bd8490f5602ea185a176817a96f0
import com.gestionVentesBackend.Model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Integer> {

    // Recherche par nom (insensible à la casse)
    List<Produit> findByNomContainingIgnoreCase(String nom);

    // Recherche par catégorie
    List<Produit> findByCategorie_Id(Integer categorieId);
    
    // Recherche par catégorie (alias)
    List<Produit> findByCategorieId(Integer categorieId);
<<<<<<< HEAD

    List<Produit> findByCategorie(Categorie categorie);
=======
>>>>>>> 8d1c0e206745bd8490f5602ea185a176817a96f0
}