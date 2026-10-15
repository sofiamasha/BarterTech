import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogoPage } from './pages/CatalogoPage';
import { ServicoDetalhesPage } from './pages/ServicoDetalhesPage';
import { MeusServicosPage } from './pages/MeusServicosPage';
import { MatchesPage } from './pages/MatchesPage';
import { PropostasPage } from './pages/PropostasPage';
import { ContratosPage } from './pages/ContratosPage';
import { PerfilPage } from './pages/PerfilPage';
import { LoadingSpinner } from './components/LoadingSpinner';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [rotaAtual, setRotaAtual] = useState<string>('landing');
  const [rotaParams, setRotaParams] = useState<any>({});

  const navegarPara = (novaRota: string, params: any = {}) => {
    setRotaParams(params);
    setRotaAtual(novaRota);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner mensagem="Inicializando a plataforma BarterTech..." />;
  }

  // Controle de rotas protegidas
  const rotaProtegida = ['dashboard', 'meus-servicos', 'matches', 'propostas', 'contratos', 'perfil'].includes(rotaAtual);

  const renderizarPagina = () => {
    if (rotaProtegida && !user) {
      return <LoginPage navegarPara={navegarPara} />;
    }

    switch (rotaAtual) {
      case 'landing':
        return user ? <DashboardPage navegarPara={navegarPara} /> : <LandingPage navegarPara={navegarPara} />;
      case 'login':
        return <LoginPage navegarPara={navegarPara} />;
      case 'cadastro':
        return <RegisterPage navegarPara={navegarPara} />;
      case 'dashboard':
        return <DashboardPage navegarPara={navegarPara} />;
      case 'catalogo':
        return <CatalogoPage navegarPara={navegarPara} />;
      case 'servico-detalhes':
        return <ServicoDetalhesPage servicoId={rotaParams.id} navegarPara={navegarPara} />;
      case 'meus-servicos':
        return <MeusServicosPage abrirModalCriacaoInicial={rotaParams.abrirModalCriacao} />;
      case 'matches':
        return <MatchesPage navegarPara={navegarPara} />;
      case 'propostas':
        return <PropostasPage navegarPara={navegarPara} />;
      case 'contratos':
        return <ContratosPage contratoDestaqueId={rotaParams.contratoDestaqueId} navegarPara={navegarPara} />;
      case 'perfil':
        return <PerfilPage />;
      default:
        return <LandingPage navegarPara={navegarPara} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar rotaAtual={rotaAtual} navegarPara={navegarPara} />
      <main className="main-content">
        {renderizarPagina()}
      </main>
      <Footer />
    </div>
  );
};
