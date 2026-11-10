import { createBrowserRouter } from "react-router";
import { HomeModern } from "./components/HomeModern";
import { Home } from "./components/Home";
import { RootLayout } from "./components/RootLayout";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { LandingPage } from "./components/LandingPage";
import { PoolList } from "./components/PoolList";
import { NewPool } from "./components/NewPool";
import { PoolDetails } from "./components/PoolDetails";
import { NewAnalysis } from "./components/NewAnalysis";
import { AnalysisHistory } from "./components/AnalysisHistory";
import { ClientList } from "./components/ClientList";
import { ClientDetails } from "./components/ClientDetails";
import { More } from "./components/More";
import { Settings } from "./components/Settings";
import { ClientImport } from "./components/ClientImport";
import { DataExport } from "./components/DataExport";
import { AIRecommendations } from "./components/AIRecommendations";
import { ORPIntelligence } from "./components/ORPIntelligence";
import { PoolInstructions } from "./components/PoolInstructions";
import { Help } from "./components/Help";
import { StoreLocator } from "./components/StoreLocator";
import { GuestAnalysis } from "./components/GuestAnalysis";
import { OwnerMode } from "./components/OwnerMode";
import { OwnerAnalysis } from "./components/OwnerAnalysis";
import { OwnerCost } from "./components/OwnerCost";
import { OwnerChat } from "./components/OwnerChat";
import { OwnerVideo } from "./components/OwnerVideo";
import { OwnerMaintenance } from "./components/OwnerMaintenance";
import { VisualTest } from "./components/VisualTest";
import { ProductPrices } from "./components/ProductPrices";
import { MondoAdmin } from "./components/MondoAdmin";
import { AppShots } from "./components/AppShots";
import { Navigate } from "react-router";
import { AvatarShowcase } from "./components/AquaSmartAvatar";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { AnalysisNotes } from "./components/AnalysisNotes";
import { PoolAnalysisHistory } from "./components/PoolAnalysisHistory";
import { AnalysisDetails } from "./components/AnalysisDetails";
import { WorkOrderPrintView } from "./components/WorkOrderPrintView";
import { EditAnalysisNotes } from "./components/EditAnalysisNotes";
import { NewWorkOrder } from "./components/NewWorkOrder";
import { WorkOrderDetails } from "./components/WorkOrderDetails";
import { RoleSelection } from "./components/RoleSelection";
import { EmployeeManagement } from "./components/EmployeeManagement";
import { AllWorkOrders } from "./components/AllWorkOrders";
import { EmployeeSelector } from "./components/EmployeeSelector";
import { WorkOrderImport } from "./components/WorkOrderImport";
import { Warehouse } from "./components/Warehouse";
import { TermsOfUse } from "./components/TermsOfUse";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { Contact } from "./components/Contact";
import { PoolVisualizer } from "./components/PoolVisualizer";

import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "guest-analysis",
        Component: GuestAnalysis,
      },
      {
        path: "owner",
        Component: OwnerMode,
      },
      {
        path: "mondo-admin",
        element: <ProtectedRoute allowedRoles={['professional']}><MondoAdmin /></ProtectedRoute>,
      },
      {
        path: "owner-analysis",
        Component: OwnerAnalysis,
      },
      {
        path: "owner-cost",
        Component: OwnerCost,
      },
      {
        path: "owner-chat",
        Component: OwnerChat,
      },
      {
        path: "owner-video",
        Component: OwnerVideo,
      },
      {
        path: "owner-maintenance",
        Component: OwnerMaintenance,
      },
      {
        path: "visual-test",
        Component: VisualTest,
      },
      {
        path: "shots",
        Component: AppShots,
      },
      {
        path: "prices",
        Component: ProductPrices,
      },
      {
        path: "instructions",
        Component: PoolInstructions,
      },
      {
        path: "avatar-showcase",
        Component: AvatarShowcase,
      },
      {
        path: "print/pools/:poolId/analysis/:analysisId",
        Component: WorkOrderPrintView,
      },
      {
        path: "terms-of-use",
        Component: TermsOfUse,
      },
      {
        path: "privacy-policy",
        Component: PrivacyPolicy,
      },
      {
        path: "contact",
        Component: Contact,
      },
      {
        path: "platform",
        Component: HomeModern,
      },
      {
        path: "role-selection",
        Component: RoleSelection,
      },
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: "app",
        element: <ProtectedRoute allowedRoles={['professional']}><Layout /></ProtectedRoute>,
        children: [
          {
            path: "employee-selector",
            Component: EmployeeSelector,
          },
          {
            index: true,
            Component: Home,
          },
          {
            path: "pools",
            Component: PoolList,
          },
          {
            path: "pools/new",
            Component: NewPool,
          },
          {
            path: "pools/:id",
            Component: PoolDetails,
          },
          {
            path: "pools/:poolId/analysis/new",
            Component: NewAnalysis,
          },
          {
            path: "pools/:poolId/history",
            Component: PoolAnalysisHistory,
          },
          {
            path: "pools/:poolId/analysis/:analysisId",
            Component: AnalysisDetails,
          },
          {
            path: "pools/:poolId/analysis/:analysisId/edit",
            Component: EditAnalysisNotes,
          },
          {
            path: "pools/:poolId/work-orders/new",
            Component: NewWorkOrder,
          },
          {
            path: "pools/:poolId/work-orders/:workOrderId",
            Component: WorkOrderDetails,
          },
          {
            path: "analysis-notes",
            Component: AnalysisNotes,
          },
          {
            path: "clients",
            Component: ClientList,
          },
          {
            path: "clients/:clientId",
            Component: ClientDetails,
          },
          {
            path: "history",
            Component: AnalysisHistory,
          },
          {
            path: "more",
            Component: More,
          },
          {
            path: "settings",
            Component: Settings,
          },
          {
            path: "client-import",
            Component: ClientImport,
          },
          {
            path: "data-export",
            Component: DataExport,
          },
          {
            path: "ai-recommendations",
            Component: AIRecommendations,
          },
          {
            path: "orp-intelligence",
            Component: ORPIntelligence,
          },
          {
            path: "help",
            Component: Help,
          },
          {
            path: "stores",
            Component: StoreLocator,
          },
          {
            path: "profile",
            Component: Settings, // Reuse Settings component for now
          },
          {
            path: "product-prices",
            Component: ProductPrices,
          },
          {
            path: "analytics-dashboard",
            Component: AnalyticsDashboard,
          },
          {
            path: "work-orders",
            element: <Navigate to="/app/all-work-orders" replace />,
          },
          {
            path: "work-orders/new",
            Component: NewWorkOrder,
          },
          {
            path: "work-orders/:id",
            Component: WorkOrderDetails,
          },
          {
            path: "employee-management",
            Component: EmployeeManagement,
          },
          {
            path: "all-work-orders",
            Component: AllWorkOrders,
          },
          {
            path: "work-order-import",
            Component: WorkOrderImport,
          },
          {
            path: "warehouse",
            Component: Warehouse,
          },
          {
            path: "pool-visualizer",
            Component: PoolVisualizer,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/owner" replace />,
      },
    ],
  },
]);