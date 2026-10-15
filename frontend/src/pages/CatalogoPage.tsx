import React, { useEffect, useState } from 'react';
import { api, Servico, PageResponse } from '../services/api';
import { Search, Filter, Layers, ArrowRight, User } from 'lucide-react';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface CatalogoPageProps {
  navegarPara: (rota: string, params?: any) => void;
}

export const CatalogoPage: React.FC<CatalogoPageProps> = ({ navegarPara }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    carregarServicos();
  }, [busca, categoriaSelecionada, pagina]);

  const carregarCategorias = async () => {
    try {
      const res = await api.servicos.listarCategorias();
      setCategorias(res);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const carregarServicos = async () => {
    try {
      setCarregando(true);
      const res = await api.servicos.pesquisar({
        busca,
        categoria: categoriaSelecionada || undefined,
        pagina,
        tamanho: 9,
      });
      setServicos(res.content);
      setTotalPaginas(res.totalPages);
      setTotalElementos(res.totalElements);
    } catch (err) {
      console.error('Erro ao pesquisar serviços:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setCategoriaSelecionada('');
    setPagina(0);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      {/* Header do Catálogo */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Oportunidades Disponíveis
        </span>
        <h2>Catálogo de Habilidades e Serviços</h2>
        <p>Explore as competências oferecidas por outros membros e inicie uma proposta de escambo colaborativo.</p>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar por termo, habilidade ou descrição..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(0); }}
            />
          </div>

          <div>
            <select 
              className="form-select"
              value={categoriaSelecionada}
              onChange={(e) => { setCategoriaSelecionada(e.target.value); setPagina(0); }}
            >
              <option value="">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
            {(busca || categoriaSelecionada) && (
              <button onClick={handleLimparFiltros} className="btn btn-ghost btn-sm">
                Limpar Filtros
              </button>
            )}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>{totalElementos}</strong> {totalElementos === 1 ? 'serviço encontrado' : 'serviços encontrados'}
            </span>
          </div>
        </div>
      </div>

      {/* Listagem de Serviços */}
      {carregando ? (
        <LoadingSpinner mensagem="Buscando serviços disponíveis no catálogo..." />
      ) : servicos.length === 0 ? (
        <EmptyState 
          icon={Layers}
          titulo="Nenhum serviço encontrado"
          descricao="Não encontramos ofertas que correspondam aos filtros selecionados. Tente buscar por outros termos ou limpe os filtros."
          acaoLabel="Limpar Filtros"
          onAcao={handleLimparFiltros}
        />
      ) : (
        <>
          <div className="grid-cols-3">
            {servicos.map(s => (
              <div key={s.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <span className="badge badge-primary">{s.categoria}</span>
                    <Badge status={s.status} />
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    {s.titulo}
                  </h3>

                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5
                  }}>
                    {s.descricao}
                  </p>
                </div>

                <div>
                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {s.proprietarioAvatarUrl ? (
                        <img src={s.proprietarioAvatarUrl} alt={s.proprietarioNome} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{s.proprietarioNome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.proprietarioLocalizacao || 'Remoto'}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      #{s.tipo}
                    </span>
                  </div>

                  <button 
                    onClick={() => navegarPara('servico-detalhes', { id: s.id })} 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Ver Detalhes & Propor Troca <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
              <button 
                onClick={() => setPagina(p => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="btn btn-secondary btn-sm"
              >
                Anterior
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Página {pagina + 1} de {totalPaginas}
              </span>
              <button 
                onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                disabled={pagina >= totalPaginas - 1}
                className="btn btn-secondary btn-sm"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
