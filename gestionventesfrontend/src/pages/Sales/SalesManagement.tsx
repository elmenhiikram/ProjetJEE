import { useEffect, useState } from 'react';
import { saleApi, type SaleRequest } from '../../api/saleApi';
import { productApi } from '../../api/productApi';
import { clientApi } from '../../api/clientApi';
import type { Sale } from '../../api/saleApi';
import type { Product } from '../../api/productApi';
import type { Client } from '../../api/clientApi';
import SaleTable from '../../components/tables/SaleTable';
import SaleForm from '../../components/forms/SaleForm';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

const SalesManagement = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes, clientsRes] = await Promise.all([
        saleApi.getAll(),
        productApi.getAll(),
        clientApi.getAll(),
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSale(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleSubmit = async (saleRequest: SaleRequest) => {
    try {
      if (
        selectedSale?.client?.id != null &&
        selectedSale?.produit?.id != null &&
        selectedSale?.dateVente &&
        selectedSale?.heureVente
      ) {
        await saleApi.update(
          selectedSale.client.id,
          selectedSale.produit.id,
          selectedSale.dateVente,
          selectedSale.heureVente,
          {
            client: { id: saleRequest.clientId },
            produit: { id: saleRequest.produitId },
            dateVente: selectedSale.dateVente,
            heureVente: selectedSale.heureVente,
            quantite: saleRequest.quantite,
          }
        );
      } else {
        await saleApi.create(saleRequest);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la vente:', error);
    }
  };

  const handleDelete = async (sale: Sale) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      try {
        const clientId = sale.client?.id;
        const produitId = sale.produit?.id;
        const dateVente = sale.dateVente;
        const heureVente = sale.heureVente;
        if (clientId == null || produitId == null || !dateVente || !heureVente) {
          console.error('Impossible de supprimer: identifiant de vente incomplet', sale);
          return;
        }
        await saleApi.delete(clientId, produitId, dateVente, heureVente);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression de la vente:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Ventes</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Nouvelle Vente
        </button>
      </div>

      <SaleTable
        sales={sales}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSale ? 'Modifier la Vente' : 'Créer une Vente'}
        size="lg"
      >
        <SaleForm
          sale={selectedSale}
          products={products}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default SalesManagement;
