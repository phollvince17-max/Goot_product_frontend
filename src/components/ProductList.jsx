import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit
  const filteredProducts = products.filter((product) =>
    [product.product_name, product.description, String(product.id)]
      .some((value) => String(value ?? '').toLowerCase().includes(query.trim().toLowerCase()))
  );
  const totalUnits = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const inventoryValue = products.reduce((total, product) => total + Number(product.price || 0) * Number(product.quantity || 0), 0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inventory" aria-label="Stockroom home">
          <span className="brand-mark"><i /><i /><i /><i /></span>
          <span>stockroom<span className="brand-period">.</span></span>
        </a>

        <div className="sidebar-label">Workspace</div>
        <nav className="side-nav" aria-label="Workspace navigation">
          <a className="side-link active" href="#inventory"><span className="nav-glyph">▦</span> Inventory</a>
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-label">Signed in</span>
          <div className="account-row">
            <span className="avatar">{(user?.username || 'U').slice(0, 1).toUpperCase()}</span>
            <span className="account-copy"><strong>{user.username}</strong><small>{isAdmin ? 'Administrator' : 'Viewer'}</small></span>
          </div>
          <button className="sidebar-logout" onClick={onLogout}>Log out <span aria-hidden="true">↗</span></button>
        </div>
      </aside>

      <main className="main-area" id="inventory">
        <div className="topline"><span>Operations <b>/</b> Inventory</span><span className="live-mark"><i /> Live catalog</span></div>

        <section className="page-heading">
          <div>
            <p className="eyebrow">CATALOG / 01</p>
            <h1>Inventory</h1>
            <p className="page-subtitle">A clear view of every item on your shelf.</p>
          </div>
          {isAdmin && <button className="button-primary" onClick={() => setFormFor({})}><span aria-hidden="true">+</span> Add product</button>}
        </section>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success" role="status" onClick={() => setNotice('')}>{notice}</div>}

        <section className="stats-band" aria-label="Inventory summary">
          <div className="stat-item"><span className="stat-label">PRODUCTS</span><strong>{products.length.toString().padStart(2, '0')}</strong><small>listed items</small></div>
          <div className="stat-item"><span className="stat-label">UNITS ON HAND</span><strong>{totalUnits.toLocaleString('en-PH')}</strong><small>across all products</small></div>
          <div className="stat-item stat-value"><span className="stat-label">STOCK VALUE</span><strong>{peso.format(inventoryValue)}</strong><small>based on current quantity</small></div>
          <div className="stat-aside" aria-hidden="true"><span>STOCK<br />CONTROL</span><i>↘</i></div>
        </section>

        <section className="catalog-section">
          <div className="catalog-heading">
            <div><p className="eyebrow">YOUR CATALOG</p><h2>All products <span>{products.length}</span></h2></div>
            <label className="search-box"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" /></label>
          </div>

          <div className="table-frame">
            {loading ? <p className="center">Loading inventory…</p> : (
              <table>
                <thead><tr><th className="col-id">REF</th><th>PRODUCT</th><th className="description-col">DESCRIPTION</th><th className="num">PRICE</th><th className="num">ON HAND</th><th className="date-col">ADDED</th>{isAdmin && <th className="action-col">ACTIONS</th>}</tr></thead>
                <tbody>
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={isAdmin ? 7 : 6} className="empty-cell">{products.length === 0 ? 'No products in the catalog yet.' : 'No products match your search.'}</td></tr>
                  )}
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="product-id">{String(product.id).padStart(3, '0')}</td>
                      <td><div className="product-name"><span className="product-stamp">{product.product_name?.slice(0, 1).toUpperCase() || 'P'}</span><strong>{product.product_name}</strong></div></td>
                      <td className="description-cell">{product.description || <span className="muted">No description</span>}</td>
                      <td className="num price-cell">{peso.format(product.price)}</td>
                      <td className="num"><span className={`stock-count ${Number(product.quantity) === 0 ? 'out-of-stock' : ''}`}>{Number(product.quantity).toLocaleString('en-PH')}<small>{Number(product.quantity) === 1 ? 'unit' : 'units'}</small></span></td>
                      <td className="date-cell">{product.created_at}</td>
                      {isAdmin && <td className="actions"><button className="action-edit" onClick={() => setFormFor(product)}>Edit</button><button className="action-delete" onClick={() => handleDelete(product)}>Delete</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="catalog-foot"><span>Showing {filteredProducts.length} of {products.length} products</span><span>Amounts in PHP <i>·</i> Catalog view</span></div>
        </section>
      </main>

      {isAdmin && formFor && <ProductForm product={formFor.id ? formFor : null} onSaved={handleSaved} onCancel={() => setFormFor(null)} />}
    </div>
  );
}
