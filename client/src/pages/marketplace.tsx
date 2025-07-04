import ContractorMarketplace from "@/pages/contractor-marketplace";
import { useAuth } from "@/hooks/use-auth";

export default function MarketplacePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contractor Marketplace</h1>
          <p className="text-gray-600">Discover featured contractors and premium services</p>
        </div>
        
        <ContractorMarketplace />
      </div>
    </div>
  );
} 