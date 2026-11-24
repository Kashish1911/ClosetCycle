import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { ApiExchange, ApiItem, ApiProMembership, fromApiItem, closetCycleApi } from './api'

type RazorpayResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
type RazorpayCheckout = { open: () => void; on: (event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void) => void }
type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { email: string }
  handler: (response: RazorpayResult) => void
  theme: { color: string }
}

declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout }
}

type Listing = {
  id: number
  name: string
  image: string
  size: string
  condition: string
  credits: number
  area: string
  category: string
  color: string
  description?: string
  brand?: string
  ownerId?: number
  ownerName?: string
  status?: string
}

const listings: Listing[] = [
  { id: 1, name: 'Vintage denim jacket', image: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=900&q=85', size: 'M', condition: 'Very good', credits: 120, area: 'North Campus', category: 'Jackets', color: 'Blue' },
  { id: 2, name: 'Terracotta floral dress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85', size: 'S', condition: 'Like new', credits: 140, area: 'Riverside', category: 'Dresses', color: 'Terracotta' },
  { id: 3, name: 'Olive wool coat', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85', size: 'L', condition: 'Good', credits: 180, area: 'Old Town', category: 'Jackets', color: 'Green' },
  { id: 4, name: 'Wide-leg black jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85', size: '28', condition: 'Very good', credits: 90, area: 'East Campus', category: 'Bottoms', color: 'Black' },
  { id: 5, name: 'Cotton striped shirt', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85', size: 'M', condition: 'Very good', credits: 75, area: 'North Campus', category: 'Tops', color: 'Cream' },
  { id: 6, name: 'Everyday canvas tote', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85', size: 'One size', condition: 'Good', credits: 45, area: 'Riverside', category: 'Accessories', color: 'Cream' },
  { id: 7, name: 'Forest knit cardigan', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85', size: 'M', condition: 'Like new', credits: 110, area: 'West End', category: 'Knitwear', color: 'Green' },
  { id: 8, name: 'Soft linen trousers', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85', size: 'S', condition: 'Very good', credits: 95, area: 'Old Town', category: 'Bottoms', color: 'Cream' },
]

const myListings = [
  { ...listings[6], status: 'Available' },
  { ...listings[4], status: 'Exchange pending' },
  { ...listings[7], status: 'Draft' },
]

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const p: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    swap: <><path d="m7 7 3-3 3 3M10 4v12a4 4 0 0 0 4 4h3" /><path d="m17 17-3 3 3 3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>
}

function go(path: string) {
  window.location.hash = path
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Button({ children, kind = 'primary', onClick, type = 'button', disabled = false, className = '' }: { children: ReactNode; kind?: 'primary' | 'secondary' | 'ghost' | 'terracotta'; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; className?: string }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`btn btn-${kind} ${className}`}>{children}</button>
}

function CreditNote({ compact = false }: { compact?: boolean }) {
  return <p className={compact ? 'credit-note compact' : 'credit-note'}><Icon name="swap" size={16} /> Swap credits are platform points, not cash.</p>
}

function Header({ route, userName, authenticated }: { route: string; userName: string; authenticated: boolean }) {
  const nav = [['Browse', 'browse'], ['How it works', 'how'], ['My wardrobe', 'wardrobe'], ['Credits', 'wallet'], ['Pro', 'pro'], ['About', 'about']]
  return <>
    <header className="header">
      <button className="brand" onClick={() => go('home')} aria-label="Closet Cycle home">
        <span className="brand-mark"><Icon name="swap" size={19} /></span><span>Closet Cycle</span>
      </button>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(([label, path]) => <button key={path} className={route === path ? 'active' : ''} onClick={() => go(path)}>{label}</button>)}
      </nav>
      <div className="header-actions">
        <button className="profile-button" onClick={() => go(authenticated ? 'profile' : 'signin')}><span className="avatar tiny">{authenticated ? userName.split(' ').map(x => x[0]).join('').slice(0, 2) : <Icon name="user" size={15} />}</span><span>{authenticated ? userName.split(' ')[0] : 'Sign in'}</span></button>
        <Button onClick={() => go('list')}><Icon name="plus" size={18} /> List an item</Button>
      </div>
      <button className="mobile-profile" onClick={() => go(authenticated ? 'profile' : 'signin')} aria-label={authenticated ? 'Open profile' : 'Sign in'}><span className="avatar tiny">{authenticated ? userName.split(' ').map(x => x[0]).join('').slice(0, 2) : <Icon name="user" size={15} />}</span></button>
    </header>
  </>
}

function MobileNav({ route }: { route: string }) {
  const links = [['browse', 'search', 'Browse'], ['wardrobe', 'heart', 'Saved'], ['list', 'plus', 'Add'], ['exchanges', 'swap', 'Exchanges'], ['profile', 'user', 'Profile']]
  return <nav className="mobile-nav">{links.map(([path, icon, label]) => <button key={path} className={route === path ? 'active' : ''} onClick={() => go(path)}><Icon name={icon} size={20} /><span>{label}</span></button>)}</nav>
}

function Footer() {
  return <footer className="footer">
    <div className="footer-main">
      <div><button className="brand light" onClick={() => go('home')}><span className="brand-mark"><Icon name="swap" /></span>Closet Cycle</button><p>Good clothes, kept in motion.<br />Made for sharing, not storing.</p></div>
      <div><h4>Closet Cycle</h4><button onClick={() => go('about')}>About Closet Cycle</button><button onClick={() => go('how')}>How it works</button><button onClick={() => go('browse')}>Browse clothes</button><button onClick={() => go('safety')}>Safety</button></div>
      <div><h4>Support</h4><button onClick={() => go('pro')}>Closet Cycle Pro</button><button onClick={() => go('help')}>Help centre</button><button onClick={() => go('terms')}>Terms</button><button onClick={() => go('privacy')}>Privacy</button></div>
      <div><h4>Stay in the loop</h4><p>Fresh swaps and community stories.</p><div className="newsletter"><input aria-label="Email address" placeholder="Email address" /><button aria-label="Subscribe"><Icon name="arrow" /></button></div></div>
    </div>
    <div className="footer-bottom"><span>© 2026 Closet Cycle. Student prototype.</span><span>Instagram &nbsp; Pinterest &nbsp; TikTok</span></div>
  </footer>
}

function ListingCard({ item, saved, onSave }: { item: Listing; saved?: boolean; onSave?: (id: number) => void }) {
  return <article className="listing-card">
    <div className="listing-image" onClick={() => go(`item/${item.id}`)}>
      <img src={item.image} alt={item.name} />
      <button className={`save-button ${saved ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); onSave?.(item.id) }} aria-label={saved ? 'Remove from saved' : 'Save item'}><Icon name="heart" /></button>
      <span className="condition-tag">{item.condition}</span>
    </div>
    <button className="listing-info" onClick={() => go(`item/${item.id}`)}>
      <div><h3>{item.name}</h3><p>Size {item.size} · {item.area}</p></div>
      <strong>{item.credits}<small> credits</small></strong>
    </button>
  </article>
}

function SectionHead({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: string }) {
  return <div className="section-head"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action && <button onClick={() => go('browse')}>{action} <Icon name="arrow" size={18} /></button>}</div>
}

function Home({ saved, onSave, items }: { saved: number[]; onSave: (id: number) => void; items: Listing[] }) {
  return <>
    <main>
      <section className="hero">
        <div className="hero-copy page-enter">
          <p className="eyebrow">A kinder way to refresh your wardrobe</p>
          <h1>Good clothes deserve <em>another go.</em></h1>
          <p className="hero-lede">Swap pre-loved pieces with your community. Find something new to you, give clothes a second life, and keep fashion moving.</p>
          <div className="button-row"><Button onClick={() => go('browse')}>Explore clothes <Icon name="arrow" /></Button><Button kind="secondary" onClick={() => go('how')}>How Closet Cycle works</Button></div>
          <p className="micro-promise">Free to browse <i /> Swap locally <i /> Wear what you love</p>
        </div>
        <div className="hero-art" aria-label="A selection of clothing moving around a swap symbol">
          <div className="hero-photo"><img src="/assets/closet-cycle-hero.png" alt="A denim jacket, knit, striped shirt, dress and tote arranged on a cream background" /></div>
          <div className="swap-orbit"><Icon name="swap" size={34} /></div>
          <span className="floating-label label-one">Listed today</span>
          <span className="floating-label label-two">Size M</span>
          <span className="floating-label label-three">120 credits</span>
        </div>
      </section>
      <section className="impact-strip" aria-label="Closet Cycle prototype facts">
        <p>What this prototype supports</p>
        <div><strong>2 ways</strong><span>direct swap or credits</span></div><div><strong>2 people</strong><span>confirm each exchange</span></div><div><strong>₹0</strong><span>payments processed</span></div>
      </section>
      <section className="section">
        <SectionHead eyebrow="Fresh from the community" title="Pieces looking for a new story" action="Browse all" />
        <div className="listing-grid">{items.slice(0, 4).map(x => <ListingCard key={x.id} item={x} saved={saved.includes(x.id)} onSave={onSave} />)}</div>
      </section>
      <section className="section how-preview">
        <SectionHead eyebrow="Simple by design" title="From their wardrobe to yours" />
        <div className="step-grid">
          {[['01', 'List what you love', 'Add a few photos, honest details and a fair credit value.'], ['02', 'Find your next piece', 'Browse nearby wardrobes and save the pieces that feel like you.'], ['03', 'Swap your way', 'Offer an item directly or use credits to balance the exchange.']].map(([n, t, d]) => <article className="step-card" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </section>
      <section className="section split-explainer">
        <div className="explainer-copy"><p className="eyebrow">Two ways to exchange</p><h2>Trade pieces, or keep it flexible.</h2><p>Offer an item they’ll love in a direct swap. Nothing to trade right now? Use swap credits earned from earlier exchanges.</p><CreditNote /><Button kind="secondary" onClick={() => go('how')}>See how exchanges work</Button></div>
        <div className="method-cards">
          <article><span className="method-icon"><Icon name="swap" /></span><div><p className="eyebrow">Direct swap</p><h3>Your jacket for their dress</h3><p>If values differ, credits can balance it clearly.</p></div></article>
          <article><span className="method-icon terracotta"><Icon name="arrow" /></span><div><p className="eyebrow">Use credits</p><h3>More freedom, fewer limits</h3><p>Request a piece without offering one back.</p></div></article>
        </div>
      </section>
      <section className="editorial">
        <div className="editorial-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85" alt="Friends enjoying fashion together" /></div>
        <div><p className="eyebrow">Illustrative prototype journey</p><h2>A community wardrobe with room for another story.</h2><p>In the demo flow, Maya lists a piece, discovers a nearby item, and arranges an exchange. This is fictional sample content, not a customer review or a real member result.</p><button onClick={() => go('browse')}>Explore sample listings <Icon name="arrow" /></button></div>
      </section>
      <section className="final-cta"><p className="eyebrow">Ready for a wardrobe refresh?</p><h2>Your next favourite piece is already out there.</h2><div className="button-row center"><Button onClick={() => go('browse')}>Browse clothes</Button><Button kind="secondary" onClick={() => go('list')}>List your first item</Button></div></section>
    </main>
  </>
}

function Browse({ saved, onSave, items }: { saved: number[]; onSave: (id: number) => void; items: Listing[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [size, setSize] = useState('All sizes')
  const [condition, setCondition] = useState('Any condition')
  const [color, setColor] = useState('Any colour')
  const [maxCredits, setMaxCredits] = useState('')
  const [sort, setSort] = useState('Recommended')
  const [limit, setLimit] = useState(6)
  const filtered = useMemo(() => items.filter(x =>
    (category === 'All categories' || x.category === category) &&
    (size === 'All sizes' || (size === 'XS–S' ? ['XS', 'S'].includes(x.size) : size === 'M' ? x.size === 'M' : ['L', 'XL'].includes(x.size))) &&
    (condition === 'Any condition' || x.condition === condition) &&
    (color === 'Any colour' || x.color.toLowerCase() === color.toLowerCase()) &&
    (!maxCredits || x.credits <= Number(maxCredits)) &&
    x.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => sort === 'Lowest credits' ? a.credits - b.credits : sort === 'Recently listed' ? b.id - a.id : 0), [items, search, category, size, condition, color, maxCredits, sort])
  const clearFilters = () => { setSearch(''); setCategory('All categories'); setSize('All sizes'); setCondition('Any condition'); setColor('Any colour'); setMaxCredits(''); setLimit(6) }
  const activeFilters = category !== 'All categories' || size !== 'All sizes' || condition !== 'Any condition' || color !== 'Any colour' || Boolean(maxCredits) || Boolean(search)
  return <main className="page browse-page">
    <div className="page-title"><p className="eyebrow">The community wardrobe</p><h1>Find something new to you.</h1><p>Thoughtful pieces, ready for their next chapter.</p></div>
    <div className="searchbar"><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jackets, dresses, brands..." aria-label="Search listings" /><Button>Search</Button></div>
    <div className="filter-row">
      <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Category"><option>All categories</option><option>Jackets</option><option>Dresses</option><option>Tops</option><option>Bottoms</option><option>Accessories</option><option>Knitwear</option></select>
      <select value={size} onChange={e => setSize(e.target.value)} aria-label="Size"><option>All sizes</option><option>XS–S</option><option>M</option><option>L–XL</option></select>
      <select value={condition} onChange={e => setCondition(e.target.value)} aria-label="Condition"><option>Any condition</option><option>Like new</option><option>Very good</option><option>Good</option></select>
      <select value={color} onChange={e => setColor(e.target.value)} aria-label="Colour"><option>Any colour</option><option>Blue</option><option>Green</option><option>Black</option><option>Cream</option><option>Terracotta</option></select>
      <label className="credit-filter">Up to <input aria-label="Maximum credits" type="number" min="0" placeholder="Any credits" value={maxCredits} onChange={e => setMaxCredits(e.target.value)} /> credits</label>
    </div>
    {activeFilters && <div className="chips">{category !== 'All categories' && <button onClick={() => setCategory('All categories')}>{category} <Icon name="close" size={14} /></button>}{size !== 'All sizes' && <button onClick={() => setSize('All sizes')}>Size {size} <Icon name="close" size={14} /></button>}{condition !== 'Any condition' && <button onClick={() => setCondition('Any condition')}>{condition} <Icon name="close" size={14} /></button>}{color !== 'Any colour' && <button onClick={() => setColor('Any colour')}>{color} <Icon name="close" size={14} /></button>}{maxCredits && <button onClick={() => setMaxCredits('')}>Up to {maxCredits} credits <Icon name="close" size={14} /></button>}{search && <button onClick={() => setSearch('')}>“{search}” <Icon name="close" size={14} /></button>}<button className="clear" onClick={clearFilters}>Clear all</button></div>}
    <div className="results-head"><p><strong>{filtered.length}</strong> pieces found</p><label>Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option>Recommended</option><option>Recently listed</option><option>Lowest credits</option></select></label></div>
    {filtered.length ? <><div className="listing-grid browse-grid">{filtered.slice(0, limit).map(x => <ListingCard key={x.id} item={x} saved={saved.includes(x.id)} onSave={onSave} />)}</div>{limit < filtered.length && <div className="load-more"><Button kind="secondary" onClick={() => setLimit(12)}>Load more pieces</Button></div>}</> :
      <div className="empty-state"><span><Icon name="search" size={30} /></span><h2>No pieces found just yet</h2><p>Try a broader search or clear a filter. New wardrobes are added every day.</p><Button kind="secondary" onClick={clearFilters}>Clear filters</Button></div>}
    <CreditNote />
  </main>
}

function ItemPage({ item, saved, onSave, items, authenticated }: { item: Listing; saved: boolean; onSave: (id: number) => void; items: Listing[]; authenticated: boolean }) {
  return <main className="page item-page">
    <div className="breadcrumbs"><button onClick={() => go('browse')}>Browse</button><Icon name="chevron" size={14} /><span>{item.category}</span><Icon name="chevron" size={14} /><span>{item.name}</span></div>
    <div className="item-layout">
      <div className="gallery"><div className="main-image"><img src={item.image} alt={item.name} /></div><div className="thumb-row">{[1, 2, 3].map((x, i) => <button className={i === 0 ? 'active' : ''} key={x}><img src={item.image} alt={`${item.name} view ${x}`} /></button>)}</div></div>
      <section className="item-details">
        <p className="eyebrow">{item.category} · Listed 2 days ago</p><h1>{item.name}</h1><div className="item-value">{item.credits} <span>swap credits</span></div><CreditNote compact />
        <div className="detail-grid"><div><span>Size</span><strong>{item.size}</strong></div><div><span>Condition</span><strong>{item.condition}</strong></div><div><span>Colour</span><strong>{item.color}</strong></div><div><span>Brand</span><strong>Unbranded</strong></div></div>
        <div className="description"><h3>About this piece</h3><p>A much-loved staple in excellent shape. Soft, comfortable and easy to layer. No visible marks or repairs, and freshly washed ready for its next wardrobe.</p><p><strong>Fit note:</strong> Relaxed fit; would also suit a smaller size worn oversized.</p></div>
        <div className="owner-card"><span className="avatar">{item.ownerName?.slice(0, 1) || 'AR'}</span><div><span>Listed by</span><h3>{item.ownerName || 'Amara R.'}</h3><p>{item.area} · Community member</p></div><button onClick={() => go('profile')}>View profile</button></div>
        <div className="item-actions"><Button onClick={() => { if (!authenticated) { sessionStorage.setItem('closet_cycle_after_signin', `request/${item.id}`); go('signin') } else go(`request/${item.id}`) }}>Request this item <Icon name="arrow" /></Button><Button kind="secondary" onClick={() => onSave(item.id)}><Icon name="heart" /> {saved ? 'Saved' : 'Save item'}</Button></div>
        {saved && <p className="success-inline"><Icon name="check" size={17} /> Saved to your wardrobe</p>}
        <p className="arrange-note"><Icon name="shield" /> After acceptance, you and the owner arrange a meetup or delivery between yourselves. Closet Cycle does not provide delivery.</p>
        <button className="text-link" onClick={() => go(`report/${item.id}`)}>Report this listing</button>
      </section>
    </div>
    <section className="related"><SectionHead title="You might also like" /><div className="listing-grid">{items.filter(x => x.id !== item.id).slice(0, 4).map(x => <ListingCard key={x.id} item={x} />)}</div></section>
  </main>
}

function RequestPage({ item, items, backendOnline, userId }: { item: Listing; items: Listing[]; backendOnline: boolean; userId: number }) {
  const [method, setMethod] = useState<'swap' | 'credits'>('swap')
  const [offer, setOffer] = useState<number | null>(7)
  const [confirmed, setConfirmed] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  if (sent) return <main className="page narrow"><div className="success-page"><span className="success-mark"><Icon name="check" size={38} /></span><p className="eyebrow">Request sent</p><h1>Your exchange is in motion.</h1><p>{item.ownerName || 'The listing owner'} has been notified. We’ll let you know when they respond.</p><div className="success-summary"><img src={item.image} alt="" /><div><span>You requested</span><strong>{item.name}</strong><p>{method === 'credits' ? `${item.credits} credits` : 'Direct swap'}</p></div></div><Button onClick={() => go('exchanges')}>View my exchanges</Button><button className="text-link" onClick={() => go('browse')}>Keep browsing</button></div></main>
  const offerItems = backendOnline ? items.filter(x => x.ownerId === userId && x.status === 'AVAILABLE') : myListings.filter(x => x.status === 'Available')
  const chosen = offerItems.find(x => x.id === offer)
  const difference = chosen ? item.credits - chosen.credits : item.credits
  const sendRequest = async () => {
    setError(''); setSending(true)
    try {
      if (backendOnline) await closetCycleApi.requestExchange({ requesterId: userId, requestedItemId: item.id, type: method === 'credits' ? 'CREDITS' : 'DIRECT_SWAP', offeredItemId: method === 'swap' ? chosen?.id : undefined })
      setSent(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send the request. Please try again.') }
    finally { setSending(false) }
  }
  return <main className="page request-page">
    <div className="flow-head"><button onClick={() => go(`item/${item.id}`)}>← Back to item</button><p>Exchange request</p><span>Step 1 of 2</span></div>
    <div className="progress"><i className="active" /><i className="active" /><i /></div>
    <div className="request-layout"><section>
      <p className="eyebrow">Choose how to exchange</p><h1>How would you like to request this?</h1><div className="method-select">
        <button className={method === 'swap' ? 'selected' : ''} onClick={() => setMethod('swap')}><span><Icon name="swap" /></span><div><strong>Direct swap</strong><p>Offer one of your available pieces.</p></div><i /></button>
        <button className={method === 'credits' ? 'selected' : ''} onClick={() => setMethod('credits')}><span><Icon name="arrow" /></span><div><strong>Use credits</strong><p>Request it with your current balance.</p></div><i /></button>
      </div>
      {method === 'swap' ? <div className="offer-section"><h2>Choose an item to offer</h2><p>Only available listings can be included.</p>{offerItems.map(x => <button className={`offer-row ${offer === x.id ? 'selected' : ''}`} onClick={() => setOffer(x.id)} key={x.id}><img src={x.image} alt="" /><div><strong>{x.name}</strong><p>Size {x.size} · {x.credits} credits</p></div><span>Available</span></button>)}
        {!offer && <p className="error-message">Choose an available item to continue.</p>}
        {!offerItems.length && <p className="error-message">You need an available listing to request a direct swap. Try using credits instead.</p>}
      </div> : <div className="balance-card"><div><span>Your balance</span><strong>260 credits</strong></div><div><span>Item value</span><strong>− {item.credits} credits</strong></div><hr /><div><span>Remaining after completion</span><strong>{260 - item.credits} credits</strong></div><p>Credits are held after acceptance and settle only when the exchange is completed.</p></div>}
      <label className="confirm-box"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span><strong>I understand the exchange details</strong><small>I’ll arrange meetup or delivery with the listing owner after acceptance and confirm only when complete.</small></span></label>
      {error && <p className="error-message" role="alert">{error}</p>}
      <Button disabled={sending || !confirmed || (method === 'swap' && (!offer || !chosen))} onClick={sendRequest}>{sending ? 'Sending…' : 'Send exchange request'} <Icon name="arrow" /></Button>
    </section>
    <aside className="request-summary"><p className="eyebrow">Your request</p><div className="summary-item"><img src={item.image} alt="" /><div><span>You’ll receive</span><strong>{item.name}</strong><p>{item.credits} credits · From the listing owner</p></div></div>{method === 'swap' && chosen && <><div className="swap-divider"><i /><span><Icon name="swap" /></span><i /></div><div className="summary-item"><img src={chosen.image} alt="" /><div><span>You’ll offer</span><strong>{chosen.name}</strong><p>{chosen.credits} credits · From you</p></div></div><div className="difference"><span>Credit difference</span><strong>{difference > 0 ? `${difference} credits from you` : 'No difference'}</strong></div></>}{method === 'credits' && <div className="difference"><span>Total held after acceptance</span><strong>{item.credits} credits</strong></div>}<CreditNote compact /></aside></div>
  </main>
}

function Wardrobe({ saved }: { saved: number[] }) {
  const [tab, setTab] = useState('My listings')
  const [toast, setToast] = useState('')
  const tabs = ['My listings', 'Incoming requests', 'Sent requests', 'Saved items']
  const doAction = (message: string) => { if (window.confirm('Are you sure? You can review the change in your exchanges.')) { setToast(message); setTimeout(() => setToast(''), 3000) } }
  return <main className="page wardrobe-page"><div className="page-title left"><p className="eyebrow">Your Closet Cycle space</p><h1>My wardrobe</h1><p>Manage pieces, requests and the things you’ve saved.</p></div><div className="tabs">{tabs.map(x => <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}{x === 'Incoming requests' && <b>2</b>}</button>)}</div>
    {tab === 'My listings' && <><div className="wardrobe-actions"><p><strong>3 listings</strong> · 1 available</p><Button onClick={() => go('list')}><Icon name="plus" /> Add a piece</Button></div><div className="manage-grid">{myListings.map(x => <article className="manage-card" key={x.id}><div className="manage-image"><img src={x.image} alt="" /><span className={`status ${x.status.toLowerCase().replace(' ', '-')}`}>{x.status}</span></div><div><h3>{x.name}</h3><p>Size {x.size} · {x.credits} credits</p><div><Button kind="secondary" onClick={() => go('list/edit')}>Edit</Button><button onClick={() => doAction(`${x.name} archived`)}>Archive</button></div></div></article>)}</div></>}
    {tab === 'Incoming requests' && <div className="request-list">{[['Amara R.', 'Vintage denim jacket', 'Forest knit cardigan', 'Direct swap', 'Pending'], ['Leo T.', 'Canvas tote', '', '45 credits', 'Pending']].map((x, i) => <article key={i}><span className="avatar">{x[0].split(' ').map(y => y[0]).join('')}</span><div><p><strong>{x[0]}</strong> wants your <strong>{x[1]}</strong></p><span>{x[3]} · Today</span></div><span className="status pending">{x[4]}</span><div className="row-actions"><Button onClick={() => doAction('Request accepted')}>Accept</Button><Button kind="secondary" onClick={() => doAction('Request declined')}>Decline</Button></div></article>)}</div>}
    {tab === 'Sent requests' && <div className="request-list"><article><span className="avatar">AR</span><div><p>You requested <strong>Vintage denim jacket</strong> from <strong>Amara R.</strong></p><span>Direct swap · Yesterday</span></div><span className="status pending">Pending</span><Button kind="secondary" onClick={() => doAction('Request cancelled')}>Cancel</Button></article></div>}
    {tab === 'Saved items' && <div className="listing-grid">{(saved.length ? listings.filter(x => saved.includes(x.id)) : listings.slice(1, 4)).map((x, i) => <div className={i === 1 ? 'unavailable-wrap' : ''} key={x.id}>{i === 1 && <span className="unavailable">No longer available</span>}<ListingCard item={x} saved /></div>)}</div>}
    {toast && <div className="toast"><Icon name="check" /> {toast}</div>}
  </main>
}

function LiveWardrobe({ userId, saved, items, onSave }: { userId: number; saved: number[]; items: Listing[]; onSave: (id: number) => void }) {
  const [tab, setTab] = useState('My listings')
  const [myItems, setMyItems] = useState<Listing[]>([])
  const [exchanges, setExchanges] = useState<ApiExchange[]>([])
  const [error, setError] = useState('')
  const tabs = ['My listings', 'Incoming requests', 'Sent requests', 'Saved items']
  const refresh = async () => {
    try {
      const [itemRows, exchangeRows] = await Promise.all([closetCycleApi.ownerItems(userId), closetCycleApi.listExchanges(userId)])
      setMyItems(itemRows.map(fromApiItem)); setExchanges(exchangeRows)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load your wardrobe.') }
  }
  useEffect(() => { void refresh() }, [userId])
  const act = async (exchange: ApiExchange, action: 'accept' | 'decline' | 'cancel') => {
    const identity = action === 'cancel' ? 'requesterId' : 'ownerId'
    try { await closetCycleApi.actOnExchange(exchange.id, action, identity, userId); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not update the request.') }
  }
  const archive = async (item: Listing) => {
    try { await closetCycleApi.changeItemStatus(item.id, userId, 'ARCHIVED'); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not archive this listing.') }
  }
  const incoming = exchanges.filter(x => x.ownerId === userId && x.status === 'REQUESTED')
  const sent = exchanges.filter(x => x.requesterId === userId && x.status === 'REQUESTED')
  return <main className="page wardrobe-page"><div className="page-title left"><p className="eyebrow">Your Closet Cycle space</p><h1>My wardrobe</h1><p>Manage pieces, requests and the things you’ve saved.</p></div><div className="tabs">{tabs.map(x => <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}{x === 'Incoming requests' && incoming.length > 0 && <b>{incoming.length}</b>}</button>)}</div>
    {error && <p className="error-message" role="alert">{error}</p>}
    {tab === 'My listings' && <><div className="wardrobe-actions"><p><strong>{myItems.length} listings</strong> · {myItems.filter(x => x.status === 'AVAILABLE').length} available</p><Button onClick={() => go('list')}><Icon name="plus" /> Add a piece</Button></div>{myItems.length ? <div className="manage-grid">{myItems.map(item => <article className="manage-card" key={item.id}><div className="manage-image"><img src={item.image} alt={item.name} /><span className={`status ${item.status?.toLowerCase()}`}>{item.status}</span></div><div><h3>{item.name}</h3><p>Size {item.size} · {item.credits} credits</p><div><Button kind="secondary" disabled={item.status === 'RESERVED' || item.status === 'EXCHANGED'} onClick={() => go(`list/edit/${item.id}`)}>Edit</Button><button disabled={item.status === 'RESERVED' || item.status === 'EXCHANGED' || item.status === 'ARCHIVED'} onClick={() => void archive(item)}>Archive</button></div></div></article>)}</div> : <div className="empty-state"><h2>Your wardrobe is ready</h2><p>List a piece to start exchanging with your community.</p><Button onClick={() => go('list')}>List an item</Button></div>}</>}
    {tab === 'Incoming requests' && <div className="request-list">{incoming.map(exchange => <article key={exchange.id}><span className="avatar">{exchange.requesterName.slice(0, 1)}</span><div><p><strong>{exchange.requesterName}</strong> wants your <strong>{exchange.requestedItem.title}</strong></p><span>{exchange.type === 'CREDITS' ? `${exchange.creditDifference} credits` : 'Direct swap'} · Request #{exchange.id}</span></div><span className="status pending">Pending</span><div className="row-actions"><Button onClick={() => void act(exchange, 'accept')}>Accept</Button><Button kind="secondary" onClick={() => void act(exchange, 'decline')}>Decline</Button></div></article>)}{!incoming.length && <div className="empty-state"><h2>No incoming requests</h2><p>New requests for your listings will appear here.</p></div>}</div>}
    {tab === 'Sent requests' && <div className="request-list">{sent.map(exchange => <article key={exchange.id}><span className="avatar">{exchange.ownerName.slice(0, 1)}</span><div><p>You requested <strong>{exchange.requestedItem.title}</strong> from <strong>{exchange.ownerName}</strong></p><span>{exchange.type === 'CREDITS' ? `${exchange.creditDifference} credits` : 'Direct swap'} · Request #{exchange.id}</span></div><span className="status pending">Pending</span><Button kind="secondary" onClick={() => void act(exchange, 'cancel')}>Cancel</Button></article>)}{!sent.length && <div className="empty-state"><h2>No sent requests</h2><p>Items you request will appear here until the owner responds.</p><Button kind="secondary" onClick={() => go('browse')}>Browse items</Button></div>}</div>}
    {tab === 'Saved items' && <div className="listing-grid">{items.filter(item => saved.includes(item.id)).map(item => <ListingCard key={item.id} item={item} saved onSave={onSave} />)}{!saved.length && <div className="empty-state"><h2>No saved pieces yet</h2><p>Save items while browsing to keep them close.</p><Button kind="secondary" onClick={() => go('browse')}>Browse items</Button></div>}</div>}
  </main>
}

function Exchanges() {
  const [filter, setFilter] = useState('All')
  const [step, setStep] = useState(2)
  const filters = ['All', 'Needs my action', 'In progress', 'Completed', 'Cancelled']
  return <main className="page"><div className="page-title left"><p className="eyebrow">Keep things moving</p><h1>Exchanges</h1><p>Track requests and confirm when pieces change hands.</p></div><div className="pill-tabs">{filters.map(x => <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div>
    <div className="exchange-layout"><section className="exchange-list"><article className="active"><div><span className="avatar">AR</span><span className="needs-action">Needs your action</span></div><h3>Exchange with Amara</h3><p>Vintage denim jacket ↔ Forest knit cardigan</p><span>Accepted · Today</span></article><article><div><span className="avatar">LT</span></div><h3>Exchange with Leo</h3><p>Canvas tote · 45 credits</p><span>Requested · 2 days ago</span></article><article><div><span className="avatar">SK</span></div><h3>Exchange with Samira</h3><p>Striped shirt ↔ Linen trousers</p><span>Completed · 12 Mar</span></article></section>
      <section className="exchange-detail"><div className="detail-head"><div><p className="eyebrow">Exchange #RW-1048</p><h2>Exchange with Amara</h2><p>Accepted 18 March 2026</p></div><span className="status available">In progress</span></div><div className="next-action"><Icon name="clock" /><div><strong>You both need to arrange the exchange</strong><p>Choose a safe meetup place or agree on delivery between yourselves.</p></div></div><div className="exchange-pair"><div><img src={listings[0].image} alt="" /><span>You receive</span><strong>{listings[0].name}</strong><small>120 credits</small></div><span><Icon name="swap" /></span><div><img src={listings[6].image} alt="" /><span>You give</span><strong>{listings[6].name}</strong><small>110 credits + 10 credits</small></div></div><div className="timeline">{['Requested', 'Accepted', 'Meetup / delivery arranged', 'Completed'].map((x, i) => <div className={i < step ? 'done' : i === step ? 'current' : ''} key={x}><i>{i < step ? <Icon name="check" size={14} /> : i + 1}</i><span>{x}<small>{i === 0 ? '17 Mar, 2:42 pm' : i === 1 ? '18 Mar, 9:15 am' : i === step ? 'Your next step' : 'Credits settle here'}</small></span></div>)}</div><div className="action-panel"><h3>{step === 2 ? 'Have you arranged the handover?' : 'Ready to finish?'}</h3><p>{step === 2 ? 'Only continue once both of you have agreed how and where to exchange.' : 'Confirm only after you have received the item.'}</p><Button onClick={() => setStep(Math.min(4, step + 1) as number)}>{step === 2 ? 'Mark as arranged' : 'Confirm completion'}</Button></div><p className="settle-note"><Icon name="shield" /> Accepting is not completion. Credits settle after both people confirm the exchange is complete.</p><div className="safe-links"><button onClick={() => go('safety')}>Safe meetup guidance</button><button onClick={() => go('help')}>Report a problem</button></div></section>
    </div>
  </main>
}

function LiveExchanges({ userId }: { userId: number }) {
  const [rows, setRows] = useState<ApiExchange[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = () => closetCycleApi.listExchanges(userId).then(data => { setRows(data); setSelectedId(current => data.some(x => x.id === current) ? current : data[0]?.id ?? null) }).catch(e => setError(e instanceof Error ? e.message : 'Could not load exchanges.'))
  useEffect(() => { void refresh() }, [])
  const selected = rows.find(x => x.id === selectedId)
  const shown = rows.filter(x => filter === 'All' || (filter === 'Needs my action' && x.status === 'REQUESTED' && x.ownerId === userId) || (filter === 'In progress' && ['ACCEPTED', 'ARRANGED'].includes(x.status)) || (filter === 'Completed' && x.status === 'COMPLETED') || (filter === 'Cancelled' && ['CANCELLED', 'REJECTED'].includes(x.status)))
  const doAction = async (action: 'accept' | 'decline' | 'cancel' | 'arrange' | 'confirm') => {
    if (!selected) return
    const identity = action === 'accept' || action === 'decline' ? 'ownerId' : action === 'cancel' ? 'requesterId' : 'participantId'
    setBusy(true); setError('')
    try { await closetCycleApi.actOnExchange(selected.id, action, identity, userId); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : 'That exchange action could not be completed.') }
    finally { setBusy(false) }
  }
  const requested = selected ? fromApiItem(selected.requestedItem) : null
  const offered = selected?.offeredItem ? fromApiItem(selected.offeredItem) : null
  return <main className="page"><div className="page-title left"><p className="eyebrow">Keep things moving</p><h1>Exchanges</h1><p>Track requests and confirm when pieces change hands.</p></div><div className="pill-tabs">{['All', 'Needs my action', 'In progress', 'Completed', 'Cancelled'].map(x => <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div>
    {error && <p className="error-message" role="alert">{error}</p>}
    {!rows.length ? <div className="empty-state"><h2>No exchange requests yet</h2><p>Browse the community wardrobe and request a piece to start an exchange.</p><Button onClick={() => go('browse')}>Browse clothes</Button></div> : <div className="exchange-layout"><section className="exchange-list">{shown.map(row => <button className={row.id === selectedId ? 'active' : ''} key={row.id} onClick={() => setSelectedId(row.id)}><div><span className="avatar">{row.ownerId === 1 ? row.requesterName.slice(0, 1) : row.ownerName.slice(0, 1)}</span><span className="needs-action">{row.status}</span></div><h3>Exchange with {row.ownerId === 1 ? row.requesterName : row.ownerName}</h3><p>{row.requestedItem.title}{row.offeredItem ? ` ↔ ${row.offeredItem.title}` : ` · ${row.creditDifference} credits`}</p><span>{row.status}</span></button>)}</section>
      {selected && requested && <section className="exchange-detail"><div className="detail-head"><div><p className="eyebrow">Exchange #{selected.id}</p><h2>Exchange with {selected.ownerId === userId ? selected.requesterName : selected.ownerName}</h2><p>{selected.status.toLowerCase().replace(/_/g, ' ')}</p></div><span className="status available">{selected.status}</span></div><div className="exchange-pair"><div><img src={requested.image} alt="" /><span>You receive</span><strong>{requested.name}</strong><small>{requested.credits} credits</small></div>{offered && <><span><Icon name="swap" /></span><div><img src={offered.image} alt="" /><span>You give</span><strong>{offered.name}</strong><small>{offered.credits} credits</small></div></>}</div><div className="timeline">{['REQUESTED', 'ACCEPTED', 'ARRANGED', 'COMPLETED'].map((x, i) => <div className={['COMPLETED'].includes(selected.status) || ['REQUESTED', 'ACCEPTED', 'ARRANGED'].indexOf(selected.status) > i ? 'done' : selected.status === x ? 'current' : ''} key={x}><i>{i + 1}</i><span>{['Requested', 'Accepted', 'Meetup / delivery arranged', 'Completed'][i]}<small>{selected.status === x ? 'Current status' : ''}</small></span></div>)}</div><div className="action-panel"><h3>Next step</h3><p>{selected.status === 'REQUESTED' ? selected.ownerId === userId ? 'Review the offer before accepting.' : 'Waiting for the listing owner to respond.' : selected.status === 'ACCEPTED' ? 'Agree on a safe meetup or delivery, then mark it arranged.' : selected.status === 'ARRANGED' ? 'Both people need to confirm after the handover.' : selected.status === 'COMPLETED' ? 'Exchange completed and credits settled.' : 'This exchange is closed.'}</p>{selected.status === 'REQUESTED' && selected.ownerId === userId && <><Button disabled={busy} onClick={() => void doAction('accept')}>Accept request</Button> <Button kind="secondary" disabled={busy} onClick={() => void doAction('decline')}>Decline</Button></>}{selected.status === 'REQUESTED' && selected.requesterId === userId && <Button kind="secondary" disabled={busy} onClick={() => void doAction('cancel')}>Cancel request</Button>}{selected.status === 'ACCEPTED' && <Button disabled={busy} onClick={() => void doAction('arrange')}>Mark handover arranged</Button>}{selected.status === 'ARRANGED' && !(selected.requesterConfirmed && selected.ownerConfirmed) && <Button disabled={busy || (selected.requesterId === userId ? selected.requesterConfirmed : selected.ownerConfirmed)} onClick={() => void doAction('confirm')}>{(selected.requesterId === userId ? selected.requesterConfirmed : selected.ownerConfirmed) ? 'You confirmed' : 'Confirm completion'}</Button>}</div><p className="settle-note"><Icon name="shield" /> Credits settle only after both people confirm the exchange is complete.</p><div className="safe-links"><button onClick={() => go('safety')}>Safe meetup guidance</button><button onClick={() => go('help')}>Report a problem</button></div></section>}</div>}
  </main>
}

function Wallet({ backendOnline, userId }: { backendOnline: boolean; userId: number }) {
  const [filter, setFilter] = useState('All')
  const [balance, setBalance] = useState(260)
  const [activity, setActivity] = useState<{ title: string; date: string; amount: number; status: string }[]>([
    { title: 'Completed exchange with Samira', date: '12 Mar 2026', amount: 25, status: 'Earned' },
    { title: 'Vintage denim jacket request', date: '18 Mar 2026', amount: -10, status: 'Pending' },
    { title: 'Canvas tote from Leo', date: '4 Mar 2026', amount: -45, status: 'Spent' },
    { title: 'Welcome to Closet Cycle', date: '20 Feb 2026', amount: 200, status: 'Earned' },
  ])
  useEffect(() => {
    if (!backendOnline) return
    Promise.all([closetCycleApi.wallet(userId), closetCycleApi.creditActivity(userId)]).then(([user, rows]) => {
      setBalance(user.creditBalance)
      setActivity(rows.map(row => ({ title: row.description, date: new Date(row.createdAt).toLocaleDateString(), amount: row.amount, status: row.amount >= 0 ? 'Earned' : 'Spent' })))
    }).catch(() => undefined)
  }, [backendOnline, userId])
  return <main className="page wallet-page"><div className="page-title left"><p className="eyebrow">Your swap wallet</p><h1>Credits</h1><p>A simple way to keep exchanges flexible.</p></div><section className="wallet-hero"><div><span>Available balance</span><strong>{balance}</strong><p>swap credits</p></div><div><h2>Points for pieces, not money.</h2><p>Credits help balance exchanges when a direct swap isn’t the right fit. Earn them when your clothes find a new home, and use them for future pieces.</p><ul><li><Icon name="check" /> Cannot be bought or withdrawn</li><li><Icon name="check" /> Only usable inside Closet Cycle</li><li><Icon name="check" /> Settle after an exchange is complete</li></ul></div></section><CreditNote />
    <section className="activity-section"><div className="section-head"><div><h2>Activity</h2><p>Your recent credit movement</p></div><div className="pill-tabs compact">{['All', 'Earned', 'Spent'].map(x => <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div></div><div className="activity-list">{activity.filter(x => filter === 'All' || x.status === filter).map((x, i) => <div key={i}><span className={`activity-icon ${x.amount > 0 ? 'in' : 'out'}`}><Icon name={x.amount > 0 ? 'arrow' : 'swap'} /></span><div><strong>{x.title}</strong><p>{x.date}</p></div><span className={`activity-status ${x.status.toLowerCase()}`}>{x.status}</span><strong className={x.amount > 0 ? 'positive' : ''}>{x.amount > 0 ? '+' : '−'}{Math.abs(x.amount)} <small>credits</small></strong></div>)}</div></section>
  </main>
}

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => window.Razorpay ? resolve() : reject(new Error('Razorpay checkout did not load. Please try again.'))
    script.onerror = () => reject(new Error('Could not load Razorpay checkout. Check your connection and try again.'))
    document.body.appendChild(script)
  })
}

function ProMembership({ authenticated, email }: { authenticated: boolean; email: string }) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly')
  const [membership, setMembership] = useState<ApiProMembership | null>(null)
  const [activationCode, setActivationCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const price = plan === 'monthly' ? '₹49' : '₹399'
  const refresh = async () => {
    try { setMembership(await closetCycleApi.proMembership()); setError('') }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load your Pro membership.') }
  }
  useEffect(() => { if (authenticated) void refresh() }, [authenticated])
  const startCheckout = async () => {
    if (!authenticated) { go('signin'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const order = await closetCycleApi.createProOrder(plan === 'monthly' ? 'MONTHLY' : 'ANNUAL')
      await loadRazorpay()
      const Razorpay = window.Razorpay
      if (!Razorpay) throw new Error('Razorpay checkout is unavailable. Please try again.')
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Closet Cycle',
        description: `Pro ${plan} pass`,
        order_id: order.orderId,
        prefill: { email },
        theme: { color: '#214030' },
        handler: response => {
          setBusy(true)
          void closetCycleApi.verifyProPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }).then(data => {
            setMembership(data)
            setNotice('Payment verified. Closet Cycle Pro is now active.')
          }).catch(e => setError(e instanceof Error ? e.message : 'Payment verification failed. Contact support before trying again.'))
            .finally(() => setBusy(false))
        },
      })
      checkout.on('payment.failed', response => {
        setError(response.error?.description || 'Payment was not completed. You have not been given Pro access.')
      })
      checkout.open()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not start checkout.') }
    finally { setBusy(false) }
  }
  const redeem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authenticated) { go('signin'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      setMembership(await closetCycleApi.redeemProCode(activationCode))
      setActivationCode('')
      setNotice('Activation code accepted. Closet Cycle Pro is now active.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not redeem the activation code.') }
    finally { setBusy(false) }
  }
  return <main className="page pro-page">
    <div className="page-title"><p className="eyebrow">Optional paid membership</p><h1>Closet Cycle <em>Pro</em></h1><p>Keep everyday exchanges free and get more room to list the pieces in your wardrobe.</p></div>
    <div className="pro-notice"><Icon name="shield" /><p><strong>Secure checkout.</strong> Payments are handled by Razorpay. Your membership activates only after the server verifies a captured payment or a valid admin-issued code. Plans are one-time payments with no automatic renewal.</p></div>
    {authenticated && membership?.active && <p className="pro-notice success" role="status"><Icon name="check" /><span><strong>Pro is active.</strong> Your {membership.plan?.toLowerCase()} pass is valid through {membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString() : 'the displayed expiry date'}.</span></p>}
    <section className="pro-plans">
      <article className="pro-card free-plan"><p className="eyebrow">Community</p><h2>Free</h2><p className="pro-price">₹0 <small>forever</small></p><p>Core exchange tools stay available to everyone.</p><ul><li><Icon name="check" /> Browse and request clothes</li><li><Icon name="check" /> Create standard listings</li><li><Icon name="check" /> Direct swaps and internal credits</li><li><Icon name="check" /> Safety and reporting tools</li></ul><Button kind="secondary" onClick={() => go('browse')}>Explore free features</Button></article>
      <article className="pro-card paid-plan"><span className="pro-badge">Optional · student-friendly</span><p className="eyebrow">Closet Cycle Pro</p><h2>More room for your wardrobe</h2><div className="plan-toggle"><button className={plan === 'monthly' ? 'active' : ''} onClick={() => setPlan('monthly')}>Monthly</button><button className={plan === 'annual' ? 'active' : ''} onClick={() => setPlan('annual')}>Annual <span>save 32%</span></button></div><p className="pro-price">{price}<small> / {plan === 'monthly' ? 'month' : 'year'}</small></p><p className="price-note">One-time payment for the selected membership period. No automatic renewal.</p><ul><li><Icon name="check" /> Up to 25 active listings (free: 3)</li><li><Icon name="check" /> Membership checked and enforced by the API</li><li><Icon name="check" /> UPI, cards, and other methods enabled by Razorpay</li></ul><Button disabled={busy || Boolean(membership?.active)} onClick={() => void startCheckout()}>{membership?.active ? 'Pro membership active' : busy ? 'Opening secure checkout…' : authenticated ? 'Continue to secure checkout' : 'Sign in to get Pro'}</Button></article>
    </section>
    {notice && <p className="pro-notice success" role="status">{notice}</p>}
    {error && <p className="error-message" role="alert">{error}</p>}
    <section className="demo-checkout"><p className="eyebrow">Have an activation code?</p><h2>Redeem an admin-issued Pro code</h2><p>Codes are single-use, time-limited when configured, and checked by the server.</p>{authenticated ? <form className="activation-form" onSubmit={redeem}><label htmlFor="pro-code">Activation code<input id="pro-code" value={activationCode} onChange={event => setActivationCode(event.target.value)} autoComplete="off" maxLength={80} required placeholder="CCPRO-…" /></label><Button type="submit" disabled={busy}>{busy ? 'Checking code…' : 'Activate Pro'}</Button></form> : <Button kind="secondary" onClick={() => go('signin')}>Sign in to redeem a code</Button>}</section>
    <section className="pro-model-note"><h2>Membership details</h2><p>Pro listing limits are enforced by the API: up to 25 active listings for Pro members and 3 for free accounts. An activation code or verified one-time Razorpay payment adds the selected membership period to any time already remaining.</p><p>Checkout stays unavailable until the server has valid Razorpay credentials. Configure test credentials first and only use live credentials after completing merchant, pricing, and consumer-policy reviews.</p></section>
  </main>
}

function HowItWorks() {
  return <main><section className="how-hero"><p className="eyebrow">Closet Cycle, step by step</p><h1>Clothes move on.<br /><em>Style keeps going.</em></h1><p>List thoughtfully, exchange clearly, and help good pieces stay in rotation.</p><div className="button-row center"><Button onClick={() => go('browse')}>Browse clothes</Button><Button kind="secondary" onClick={() => go('list')}>List an item</Button></div></section><section className="section process"><div className="process-line" />{[['01', 'List a piece', 'Share up to five clear photos, sizing and an honest condition note.'], ['02', 'Find a match', 'Browse your community and request a piece you love.'], ['03', 'Choose your route', 'Offer a direct swap or use credits. Any difference stays visible.'], ['04', 'Arrange safely', 'After acceptance, agree on a public meetup or delivery yourselves.'], ['05', 'Confirm completion', 'Both people confirm, then credits settle automatically.']].map(x => <article key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</section><section className="examples section"><SectionHead eyebrow="A fair, flexible system" title="A swap can work two ways" /><div><article><h3>Equal-value direct swap</h3><div className="formula"><span>Denim jacket<br /><strong>120 credits</strong></span><Icon name="swap" /><span>Wool coat<br /><strong>120 credits</strong></span></div><p>No credits change hands.</p></article><article><h3>Credit-balanced swap</h3><div className="formula"><span>Knit cardigan<br /><strong>110 credits</strong></span><b>+</b><span><strong>10 credits</strong></span><b>=</b><span>Denim jacket<br /><strong>120 credits</strong></span></div><p>The difference is always shown before you send.</p></article></div><CreditNote /></section><section className="safety-banner"><Icon name="shield" size={42} /><div><p className="eyebrow">Exchange with care</p><h2>Meet in public. Keep details private.</h2><p>Share only what’s needed to arrange the exchange. Check the item together before confirming completion.</p></div><Button kind="secondary" onClick={() => go('safety')}>Read safety guidance</Button></section></main>
}

function ListingForm({ backendOnline, userId, items, onCreated }: { backendOnline: boolean; userId: number; items: Listing[]; onCreated: (item: Listing) => void }) {
  const edit = window.location.hash.includes('/edit')
  const editId = Number(window.location.hash.split('/')[2])
  const existing = edit ? items.find(item => item.id === editId) : undefined
  const [preview, setPreview] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState(existing?.name || '')
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError('')
    if (!title.trim()) return
    setPublishing(true)
    try {
      if (backendOnline) {
        const form = new FormData(e.currentTarget)
        const file = form.get('image') as File | null
        const uploaded = file?.size ? await closetCycleApi.uploadImage(file) : undefined
        const payload = {
          title: String(form.get('title') || '').trim(), category: form.get('category'), size: form.get('size'),
          conditionLabel: form.get('condition'), color: form.get('color'), brand: form.get('brand'),
          description: form.get('description'), creditValue: Number(form.get('creditValue')), ownerId: userId,
          imageUrl: uploaded?.url,
        }
        const created = edit && existing ? await closetCycleApi.updateItem(existing.id, payload) : await closetCycleApi.createItem(payload)
        onCreated(fromApiItem(created))
      }
      setPublished(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not publish this listing.') }
    finally { setPublishing(false) }
  }
  if (published) return <main className="page narrow"><div className="success-page"><span className="success-mark"><Icon name="check" size={38} /></span><p className="eyebrow">Published</p><h1>Your piece is live.</h1><p>It’s now part of the community wardrobe. You can edit availability at any time.</p><Button onClick={() => go('wardrobe')}>View my wardrobe</Button><button className="text-link" onClick={() => go('browse')}>Browse listings</button></div></main>
  return <main className="page form-page"><div className="form-head"><div><p className="eyebrow">{edit ? 'Edit listing' : 'Share a piece'}</p><h1>{edit ? 'Update your listing' : 'List something worth rewearing.'}</h1><p>Clear photos and honest details help good exchanges happen.</p><small className="price-note">Free accounts can keep 3 active listings; Pro members can keep 25. The API enforces this limit.</small></div><span>Draft saved just now</span></div><form onSubmit={submit}><section className="form-card"><h2>Photos</h2><p>Add up to 5 photos. Show the full item, label and any signs of wear.</p><div className="uploads">{edit && <div className="uploaded"><img src={existing?.image || listings[6].image} alt="" /><button type="button"><Icon name="close" /></button></div>}<label className="upload-box"><Icon name="plus" size={28} /><strong>Add photos</strong><span>JPG or PNG · max 10MB</span><input name="image" accept="image/png,image/jpeg,image/webp" type="file" hidden /></label></div></section><section className="form-card"><h2>Piece details</h2><div className="form-grid"><label className="full">Title<input required name="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Forest green knit cardigan" />{!title && <small>Use a clear, descriptive title.</small>}</label><label>Category<select name="category" defaultValue={existing?.category || 'Knitwear'}><option>Knitwear</option><option>Jackets</option><option>Dresses</option><option>Tops</option></select></label><label>Size<select name="size" defaultValue={existing?.size || 'M'}><option>M</option><option>S</option><option>L</option><option>One size</option></select></label><label>Condition<select name="condition" defaultValue={existing?.condition || 'Like new'}><option>Like new</option><option>Very good</option><option>Good</option></select></label><label>Colour<input name="color" defaultValue={existing?.color || ''} placeholder="Main colour" /></label><label className="full">Brand <span>(optional)</span><input name="brand" defaultValue={existing?.brand || ''} placeholder="Brand or maker" /></label><label className="full">Description<textarea name="description" rows={5} defaultValue={existing?.description || ''} placeholder="Describe the fabric, fit, details and any signs of wear." /><small>20–500 characters</small></label></div></section><section className="form-card"><h2>Exchange details</h2><div className="form-grid"><label>Suggested credit value<input name="creditValue" type="number" min="1" max="10000" defaultValue={existing?.credits} placeholder="e.g. 80" /><small>For exchange balancing, not a sale price.</small></label><label>Broad meetup area<input name="area" defaultValue={existing?.area || ''} placeholder="e.g. North Campus" /><small>Never add your full address.</small></label></div><CreditNote compact /></section><label className="confirm-box"><input required type="checkbox" /><span><strong>I own this item and the details are accurate</strong><small>I’ve shown and described its condition honestly.</small></span></label><div className="form-actions"><Button kind="ghost" onClick={() => { localStorage.setItem("closet-cycle-listing-draft", title); setError("Draft saved on this device.") }}>Save draft</Button><Button kind="secondary" onClick={() => setPreview(!preview)}>Preview</Button><Button type="submit">Publish listing</Button></div>{error && <p className="error-message" role="alert">{error} {error.includes('Free accounts') && <button className="text-link" type="button" onClick={() => go('pro')}>View Pro</button>}</p>}</form>{preview && <div className="preview-drawer"><button onClick={() => setPreview(false)}><Icon name="close" /></button><p className="eyebrow">Listing preview</p><h2>{title || 'Untitled piece'}</h2><ListingCard item={{ ...(existing || listings[6]), name: title || 'Untitled piece' }} /></div>}</main>
}

function Profile({ currentUser, onSignOut, onUpdate, savedCount }: { currentUser: { id: number; name: string; email: string; area: string }; onSignOut: () => void; onUpdate: (user: { id: number; name: string; email: string; area: string }) => void; savedCount: number }) {
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  const [settings, setSettings] = useState('')
  const [profileItems, setProfileItems] = useState<ApiItem[]>([])
  const [history, setHistory] = useState<ApiExchange[]>([])
  useEffect(() => { Promise.all([closetCycleApi.ownerItems(currentUser.id), closetCycleApi.listExchanges(currentUser.id)]).then(([items, exchanges]) => { setProfileItems(items); setHistory(exchanges) }).catch(e => setNotice(e instanceof Error ? e.message : 'Could not load your activity.')) }, [currentUser.id])
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setNotice('')
    const form = new FormData(event.currentTarget)
    try {
      const user = await closetCycleApi.updateProfile(currentUser.id, { displayName: String(form.get('displayName') || '').trim(), area: String(form.get('area') || '').trim() })
      onUpdate({ id: user.id, name: user.displayName, email: user.email, area: user.area }); setEditing(false); setNotice('Profile updated.')
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Profile could not be updated.') }
  }
  return <main className="page profile-page"><section className="profile-hero"><div className="avatar large">{currentUser.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div><p className="eyebrow">Community member</p><h1>{currentUser.name}</h1><p>{currentUser.area} · Here to keep good clothes in circulation.</p><Button kind="secondary" onClick={() => setEditing(!editing)}>{editing ? 'Close editor' : 'Edit profile'}</Button></div></section>
    {editing && <form className="form-card profile-editor" onSubmit={saveProfile}><h2>Edit your profile</h2><div className="form-grid"><label>Display name<input name="displayName" defaultValue={currentUser.name} required maxLength={80} /></label><label>Email<input defaultValue={currentUser.email} disabled /></label><label>Campus or broad area<input name="area" defaultValue={currentUser.area} required maxLength={100} /></label></div><Button type="submit">Save profile</Button></form>}
    <div className="profile-stats"><div><strong>{profileItems.length}</strong><span>Listings</span></div><div><strong>{history.filter(x => x.status === 'COMPLETED').length}</strong><span>Completed exchanges</span></div><div><strong>{savedCount}</strong><span>Saved pieces on this device</span></div></div><div className="settings-layout"><section><h2>Exchange history</h2><div className="activity-list">{history.map(exchange => <div key={exchange.id}><span className="avatar">{(exchange.ownerId === currentUser.id ? exchange.requesterName : exchange.ownerName).slice(0, 1)}</span><div><strong>Exchange with {exchange.ownerId === currentUser.id ? exchange.requesterName : exchange.ownerName}</strong><p>{exchange.requestedItem.title}{exchange.offeredItem ? ` ↔ ${exchange.offeredItem.title}` : ` · ${exchange.creditDifference} credits`} · {exchange.status.toLowerCase().replace(/_/g, " ")}</p></div><span className="status available">{exchange.status}</span></div>)}{history.length === 0 && <p>No exchanges yet.</p>}</div></section><aside><h2>Settings</h2>{['Account details', 'Notifications', 'Privacy preferences', 'Help & reporting'].map(x => <button key={x} onClick={() => x === 'Privacy preferences' ? go('privacy') : x === 'Help & reporting' ? go('help') : setSettings(settings === x ? '' : x)}>{x}<Icon name="chevron" size={17} /></button>)}{settings && <div className="privacy-callout"><strong>{settings}</strong><p>{settings === 'Notifications' ? 'Exchange status updates are enabled for this prototype.' : 'Your sign-in details are managed by your account.'}</p></div>}<div className="privacy-callout"><Icon name="shield" /><p>Keep your full address and sensitive personal details private.</p></div><button className="sign-out" onClick={onSignOut}>Sign out</button></aside></div>{notice && <div className="toast"><Icon name="check" /> {notice}</div>}</main>
}

function SignIn({ onAuthenticated }: { onAuthenticated: (user: { id: number; name: string; email: string; area: string }) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [show, setShow] = useState(false)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(''); setBusy(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')
    if (mode === 'reset') { setDone(true); setBusy(false); return }
    if (mode === 'signup' && password !== form.get('confirmPassword')) { setError('Passwords do not match.'); setBusy(false); return }
    try {
      const auth = mode === 'signup'
        ? await closetCycleApi.register({ displayName: form.get('displayName'), email, password, area: form.get('area') })
        : await closetCycleApi.login({ email, password })
      localStorage.setItem('closet_cycle_access_token', auth.accessToken)
      localStorage.setItem('closet_cycle_user', JSON.stringify({ id: auth.user.id, name: auth.user.displayName, email: auth.user.email, area: auth.user.area }))
      onAuthenticated({ id: auth.user.id, name: auth.user.displayName, email: auth.user.email, area: auth.user.area })
      const next = sessionStorage.getItem('closet_cycle_after_signin')
      sessionStorage.removeItem('closet_cycle_after_signin')
      go(next || 'home')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not sign in. Please try again.') }
    finally { setBusy(false) }
  }
  return <main className="auth-page"><section className="auth-art"><button className="brand light" onClick={() => go('home')}><span className="brand-mark"><Icon name="swap" /></span>Closet Cycle</button><div><p className="eyebrow">The community wardrobe</p><h1>Wear more.<br />Waste less.</h1><p>Join people nearby giving good clothes another go.</p></div></section><section className="auth-form">{done ? <div className="success-page"><span className="success-mark"><Icon name="check" /></span><h1>Reset link requested</h1><p>Password reset delivery is not configured yet. Contact the project administrator for a demo account.</p><Button onClick={() => { setDone(false); setMode('signin') }}>Back to sign in</Button></div> : <form onSubmit={submit}><p className="eyebrow">{mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Join Closet Cycle' : 'Reset password'}</p><h1>{mode === 'signin' ? 'Sign in to your wardrobe' : mode === 'signup' ? 'Create your account' : 'Let’s get you back in'}</h1><p>Swap thoughtfully with your local community.</p>{mode === 'signup' && <><label>Display name<input name="displayName" required placeholder="Your name" /></label><label>Campus or broad area<input name="area" required placeholder="e.g. North Campus" /></label></>}<label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label>{mode !== 'reset' && <label>Password<div className="password"><input name="password" required type={show ? 'text' : 'password'} minLength={8} placeholder="At least 8 characters" /><button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div></label>}{mode === 'signup' && <><label>Confirm password<input name="confirmPassword" required type="password" minLength={8} /></label><label className="checkline"><input required type="checkbox" /> I agree to the <button type="button" onClick={() => go('terms')}>Terms</button> and <button type="button" onClick={() => go('privacy')}>Privacy policy</button>.</label></>}{mode === 'signin' && <button type="button" className="forgot" onClick={() => setMode('reset')}>Forgot password?</button>}{error && <p className="error-message" role="alert">{error}</p>}<Button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</Button><p className="auth-switch">{mode === 'signin' ? <>New to Closet Cycle? <button type="button" onClick={() => setMode('signup')}>Create an account</button></> : <>Already have an account? <button type="button" onClick={() => setMode('signin')}>Sign in</button></>}</p><small className="prototype-note">Demo password reset is shown locally; email delivery is not configured.</small></form>}</section></main>
}
function AuthRequired({ destination }: { destination: string }) {
  return <main className="page narrow"><div className="empty-state"><span><Icon name="user" size={30} /></span><h2>Sign in to continue</h2><p>Your wardrobe, exchange requests, and credit balance are linked to your account.</p><Button onClick={() => { sessionStorage.setItem('closet_cycle_after_signin', destination); go('signin') }}>Sign in or create an account</Button></div></main>
}

function InfoPage({ type }: { type: string }) {
  const content: Record<string, { eyebrow: string; title: string; intro: string; sections: [string, string][] }> = {
    safety: { eyebrow: 'Exchange with confidence', title: 'Safety on Closet Cycle', intro: 'A few thoughtful habits make community exchange easier and safer for everyone.', sections: [['Meet in a public place', 'Choose a well-lit, familiar location and tell someone where you are going. You never need to share your home address.'], ['Check before you confirm', 'Look over the item together. Only confirm completion once both people are happy with the exchange.'], ['Trust your instincts', 'Cancel if something does not feel right. Report concerning behaviour so the moderation team can review it.']] },
    terms: { eyebrow: 'Sample legal UI', title: 'Community terms', intro: 'These sample terms illustrate the intended product experience and require legal review before launch.', sections: [['Own what you list', 'Only list items you own and have the right to exchange. Prohibited or counterfeit items are not allowed.'], ['Describe pieces honestly', 'Show wear, repairs and flaws clearly. Credit values help balance exchanges and are not sale prices.'], ['Cancellation and conduct', 'Communicate changes promptly. Repeated no-shows, harassment, or unsafe conduct may lead to account restrictions.']] },
    privacy: { eyebrow: 'Prototype data handling', title: 'Privacy overview', intro: 'This student prototype is not a final privacy notice. Its connected API stores account, listing, exchange and report data to demonstrate the product. Review data handling and retention before a real pilot.', sections: [['Account and exchange data', 'The API stores a display name, email, broad area, password hash, listings, exchange requests, credit ledger entries and reports. Never put a home address or sensitive personal data in a listing.'], ['Browser storage', 'This browser stores the sign-in token and saved listing IDs in localStorage. Sign out to remove the token and demo profile from this browser. Saved listing IDs can be cleared from browser storage.'], ['Controls and limitations', 'A production deletion request, consent-preference center, analytics-cookie controls, and support-ticket system are not implemented in this prototype. Contact the project team before entering real member data.']] },
  }
  const c = content[type] || content.safety
  return <main className="info-page"><div className="info-hero"><p className="eyebrow">{c.eyebrow}</p><h1>{c.title}</h1><p>{c.intro}</p></div><div className="info-sections">{c.sections.map((x, i) => <section key={x[0]}><span>0{i + 1}</span><div><h2>{x[0]}</h2><p>{x[1]}</p></div></section>)}</div><div className="info-cta"><Icon name="shield" /><div><h2>Need more help?</h2><p>Tell us what happened and the team can review it.</p></div><Button kind="secondary" onClick={() => go('help')}>Contact support</Button></div></main>
}

function AboutPage() {
  const startupPrograms = [
    { name: 'Startup India Seed Fund Scheme', text: 'SISFS has supported proof of concept, prototype development, product trials, and market entry through selected incubators. Check the latest official call, eligibility, and application window before applying.', href: 'https://www.startupindia.gov.in/', label: 'Startup India' },
    { name: 'SAMRIDH and TIDE 2.0', text: 'MeitY programs have supported technology ventures through selected accelerators and incubators, including product development, mentoring, and market access. Availability depends on participating partners and current calls.', href: 'https://msh.meity.gov.in/schemes/samridh', label: 'MeitY SAMRIDH' },
    { name: 'DST NIDHI programs', text: 'NIDHI includes pathways such as entrepreneur-in-residence support, prototype assistance, and incubator-led seed support. Each program has distinct eligibility and application rules.', href: 'https://nidhi.dst.gov.in/schemes-programmes/', label: 'DST NIDHI programs' },
    { name: 'AIM, MSME and Make in India', text: 'Atal Incubation Centres and MSME initiatives support innovation through participating institutions. Make in India focuses on manufacturing and product innovation. These are different pathways—not automatic grants or benefits for Closet Cycle.', href: 'https://www.aim.gov.in/atal-incubation-centres.php', label: 'Atal Incubation Centres' },
  ]
  return <main className="info-page about-page">
    <div className="info-hero about-hero">
      <p className="eyebrow">About Closet Cycle</p><h1>Good clothes, kept in motion.</h1>
      <p>A student-built clothing exchange prototype for local communities. List pre-loved pieces, arrange a direct swap or use non-cash platform credits, and confirm an exchange together.</p>
      <div className="about-notice"><Icon name="shield" /><span>This is an educational prototype—not a registered startup, legal or security service, or government-affiliated program. Closet Cycle does not claim DPIIT recognition, grants, incubator admission, or verified customer results.</span></div>
    </div>

    <section className="about-section">
      <div className="about-section-head"><p className="eyebrow">01 · What we do</p><h2>A simple way to exchange locally</h2><p>Keep useful clothing in circulation while making each exchange clear and member-led.</p></div>
      <div className="about-cards three">
        <article><span>01</span><h3>Share honestly</h3><p>List clear photos, sizing, condition, and a broad meetup area. Never publish a home address.</p></article>
        <article><span>02</span><h3>Choose an exchange</h3><p>Offer a direct item swap or balance an exchange with platform credits. Credits are not cash and cannot be used outside Closet Cycle.</p></article>
        <article><span>03</span><h3>Confirm together</h3><p>Members arrange their own handover. Credits settle only after both people confirm completion.</p></article>
      </div>
    </section>

    <section className="about-section about-tint">
      <div className="about-section-head"><p className="eyebrow">02 · Startup ecosystem in India</p><h2>Know the pathways. Check the rules.</h2><p>Recognition, incubation, and funding programs serve different kinds of ventures. They have separate legal, eligibility, and application requirements; mentioning them does not mean Closet Cycle qualifies.</p></div>
      <div className="about-topic-grid">
        <article><h3>Startup India and DPIIT</h3><p>DPIIT recognition is an application-based route for eligible entities. Entity type, age, turnover, innovation criteria, and current rules matter. Some benefits also require separate approval; recognition is not automatic.</p><a className="about-link" href="https://www.startupindia.gov.in/content/sih/en/startupgov/startup_recognition_page.html" target="_blank" rel="noreferrer">Review current recognition rules <Icon name="arrow" size={16} /></a></article>
        <article><h3>Ease of doing business</h3><p>Portals such as the National Single Window System help businesses discover and apply for selected central and state approvals. Online registration does not replace licences or obligations that apply to a particular entity.</p><a className="about-link" href="https://www.nsws.gov.in/" target="_blank" rel="noreferrer">National Single Window System <Icon name="arrow" size={16} /></a></article>
        <article><h3>Incubators and accelerators</h3><p>Participating incubators can offer mentoring, labs, product advice, market connections, and funding access. Examples include FITT at IIT Delhi, SINE at IIT Bombay, CIIE.CO at IIM Ahmedabad, STPI centres, T-Hub, and GUSEC. These are examples, not affiliations or endorsements.</p><a className="about-link" href="https://msh.meity.gov.in/tide/incubatorslist" target="_blank" rel="noreferrer">Explore MeitY-linked centres <Icon name="arrow" size={16} /></a></article>
      </div>
      <div className="about-cards two about-benefit-cards">
        <article><span className="about-card-mark">↗</span><h3>Potential DPIIT-recognition benefits</h3><p>Depending on current rules and separate approvals, eligible startups may access selected self-certification routes, IPR facilitation and fee support, tax benefits, or easier closure processes. These are not automatic; verify the exact conditions with Startup India and the relevant authority.</p></article>
        <article><span className="about-card-mark">↗</span><h3>MSME and Make in India</h3><p>MSME registration, credit and incubation initiatives, and Make in India programs are distinct from DPIIT recognition. Product and manufacturing support depends on the business, scheme, lender, and current application call.</p><a className="about-link" href="https://msme.gov.in/" target="_blank" rel="noreferrer">MSME Ministry information <Icon name="arrow" size={16} /></a></article>
      </div>
      <div className="about-section-head compact-head"><p className="eyebrow">Programs to research</p><h2>Funding and innovation support</h2></div>
      <div className="about-cards two">{startupPrograms.map(program => <article key={program.name}><span className="about-card-mark">↗</span><h3>{program.name}</h3><p>{program.text}</p><a className="about-link" href={program.href} target="_blank" rel="noreferrer">{program.label} <Icon name="arrow" size={16} /></a></article>)}</div>
      <div className="about-callout"><strong>Not guaranteed funding</strong><p>Startup India Seed Fund, MeitY SAMRIDH and TIDE 2.0, DST NIDHI, AIM, and MSME pathways each have their own partners, criteria, and open calls. Funding amounts and availability change; verify them with the official program before relying on them. Make in India is an industrial initiative, not a grant by itself.</p></div>
    </section>

    <section className="about-section">
      <div className="about-section-head"><p className="eyebrow">03 · Intellectual property</p><h2>Respect and protect creative work</h2><p>IPR support can include prior-art and patent searches, drafting and filing guidance, trademarks, designs, copyright, and legal advice. Government-listed facilitators or an IP professional can explain current eligibility, fees, and any available support.</p><a className="about-link" href="https://www.startupindia.gov.in/content/sih/en/startup-scheme.html" target="_blank" rel="noreferrer">Startup India IPR information <Icon name="arrow" size={16} /></a></div>
      <div className="about-cards three"><article><span>01</span><h3>Search before filing</h3><p>Check existing patents, marks, and designs before investing in an application.</p></article><article><span>02</span><h3>Document ownership</h3><p>Keep clear records of original designs, code, branding, and contributor permissions.</p></article><article><span>03</span><h3>Use media responsibly</h3><p>Get permission for third-party photos, logos, testimonials, and other creative work.</p></article></div>
      <div className="about-callout"><strong>Closet Cycle status</strong><p>This student project does not claim a patent, registered trademark, copyright registration, DPIIT recognition, grant, or legal review.</p></div>
    </section>

    <section className="about-section about-tint">
      <div className="about-section-head"><p className="eyebrow">04 · Digital law and data privacy</p><h2>Be transparent about data and rights</h2><p>Rules depend on where a service and its users are located, the data involved, and when provisions take effect. This overview is educational—not legal advice or a claim of compliance.</p></div>
      <div className="about-topic-grid">
        <article><h3>India’s IT Act</h3><p>The Information Technology Act, 2000, as amended, provides a framework for electronic records and signatures, online activity, and specified cyber offences. It supports the legal recognition of digital transactions; related rules and other laws may also apply to an online service.</p><a className="about-link" href="https://www.indiacode.nic.in/handle/123456789/1999?locale=en" target="_blank" rel="noreferrer">Read the Act on India Code <Icon name="arrow" size={16} /></a></article>
        <article><h3>Privacy, DPDP and consent</h3><p>Tell people what personal information is collected and why; collect only what is needed; set retention and deletion practices; and protect access. India’s DPDP Act and Rules have commencement and compliance requirements that should be checked against current official notices.</p><a className="about-link" href="https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa" target="_blank" rel="noreferrer">DPDP Rules information <Icon name="arrow" size={16} /></a></article>
        <article><h3>GDPR and cookies</h3><p>GDPR can apply when processing falls within its territorial scope and provides rights such as access, correction, erasure, portability, and objection in applicable cases. Explain cookies or browser storage, distinguish necessary storage from optional analytics or advertising, and obtain consent where required. This prototype uses localStorage for sign-in and saved items; a preference centre is not implemented.</p><a className="about-link" href="https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en" target="_blank" rel="noreferrer">European Commission GDPR overview <Icon name="arrow" size={16} /></a></article>
      </div>
    </section>

    <section className="about-section">
      <div className="about-section-head"><p className="eyebrow">05 · Cybersecurity</p><h2>Build security into the service</h2><p>Security is ongoing work across people, devices, applications, networks, and data—not a single feature or certification.</p></div>
      <div className="about-cards three">
        <article><span>01</span><h3>TLS / HTTPS</h3><p>Use HTTPS in production to protect browser-to-server traffic in transit and verify the service identity. Do not send sensitive information over an untrusted connection.</p></article>
        <article><span>02</span><h3>Encryption and access</h3><p>Use TLS to protect data in transit and appropriate encryption for stored data. Combine strong password hashing with least-privilege access, managed secrets, and regular software updates.</p></article>
        <article><span>03</span><h3>Firewalls and monitoring</h3><p>Use network rules to limit unnecessary traffic, monitor for unusual activity, and prepare incident and recovery procedures. Members should use unique passwords and keep devices updated.</p></article>
      </div>
      <div className="about-callout"><strong>Prototype limitations</strong><p>The API hashes passwords and uses signed tokens, but this project is not a security certification. HTTPS deployment, production secret management, ongoing security testing, incident response, and two-factor authentication are not provided by this local demo.</p></div>
    </section>

    <section className="about-section about-tint">
      <div className="about-section-head"><p className="eyebrow">06 · Ethical digital commerce</p><h2>No fake trust. No dark patterns.</h2><p>Digital interfaces should help people make informed choices—not manipulate them. India’s dark-pattern guidance describes deceptive interface practices; applicable obligations should be reviewed for the service and its context.</p><a className="about-link" href="https://consumeraffairs.nic.in/sites/default/files/The%20Guidelines%20for%20Prevention%20and%20Regulation%20of%20Dark%20Patterns%2C%202023.pdf" target="_blank" rel="noreferrer">Read India’s dark-pattern guidelines <Icon name="arrow" size={16} /></a></div>
      <div className="about-cards three">
        <article><span>01</span><h3>Honest reviews and listings</h3><p>Fake or manipulated reviews distort decisions and undermine trust. Demo listings are fictional; member-submitted item details should be accurate and clearly describe flaws.</p></article>
        <article><span>02</span><h3>Clear choices</h3><p>Avoid forced sign-ups, hidden costs, misleading urgency, preselected add-ons, and difficult-to-find cancel or decline controls.</p></article>
        <article><span>03</span><h3>Transparent exchanges</h3><p>Keep fees and exchange terms visible. Closet Cycle credits are not money, and a handover is complete only after both members confirm it.</p></article>
      </div>
    </section>

    <div className="info-cta"><Icon name="swap" /><div><h2>Explore the prototype</h2><p>Browse sample listings and see how a community exchange works.</p></div><Button onClick={() => go('browse')}>Browse clothes</Button><Button kind="secondary" onClick={() => go('pro')}>View Pro plan</Button></div>
  </main>
}

function Help() {
  const [sent, setSent] = useState(false)
  return <main className="page narrow"><div className="page-title"><p className="eyebrow">We’re here to help</p><h1>How can we help?</h1><p>Browse common topics or send a message using this prototype form.</p></div>{sent ? <div className="success-page"><span className="success-mark"><Icon name="check" /></span><h2>Message received</h2><p>This is a prototype confirmation. No support ticket was created.</p><Button onClick={() => go('home')}>Back home</Button></div> : <form className="help-form" onSubmit={e => { e.preventDefault(); setSent(true) }}><label>Topic<select><option>Exchange problem</option><option>Listing question</option><option>Safety concern</option><option>Account help</option></select></label><label>Email<input required type="email" placeholder="you@example.com" /></label><label>What happened?<textarea required rows={6} placeholder="Share the details we need to understand the issue." /></label><Button type="submit">Send message</Button></form>}</main>
}

function ReportPage({ item }: { item: Listing }) {
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      await closetCycleApi.createReport(item.id, { reason: String(form.get('reason') || ''), details: String(form.get('details') || '').trim() })
      setSent(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Report could not be submitted.') }
    finally { setBusy(false) }
  }
  if (sent) return <main className="page narrow"><div className="success-page"><span className="success-mark"><Icon name="check" /></span><p className="eyebrow">Report received</p><h1>Thank you for letting us know.</h1><p>A moderator can review the listing and the reason you shared.</p><Button onClick={() => go('browse')}>Back to browsing</Button></div></main>
  return <main className="page narrow"><div className="page-title left"><p className="eyebrow">Community care</p><h1>Report this listing</h1><p>{item.name}</p></div><form className="form-card" onSubmit={submit}><label>What is the concern?<select name="reason" required defaultValue=""><option value="" disabled>Select a reason</option><option>Condition does not match</option><option>Counterfeit or prohibited item</option><option>Inaccurate or misleading details</option><option>Safety concern</option><option>Other</option></select></label><label>Details<textarea name="details" rows={5} maxLength={1000} placeholder="Share only details relevant to the report." /></label>{error && <p className="error-message" role="alert">{error}</p>}<div className="form-actions"><Button kind="secondary" onClick={() => go(`item/${item.id}`)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Submit report'}</Button></div></form></main>
}

function Admin({ isAdmin, currentUserId }: { isAdmin: boolean; currentUserId: number }) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof closetCycleApi.adminReports>>>([])
  const [users, setUsers] = useState<Awaited<ReturnType<typeof closetCycleApi.adminUsers>>>([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [roleBusyId, setRoleBusyId] = useState<number | null>(null)
  const [codeBusy, setCodeBusy] = useState(false)
  const [issuedCode, setIssuedCode] = useState<Awaited<ReturnType<typeof closetCycleApi.createAdminProCode>> | null>(null)
  const [codeNotice, setCodeNotice] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'codes'>('overview')
  const [userQuery, setUserQuery] = useState('')
  const refresh = async () => {
    try {
      const reportRequest = closetCycleApi.adminReports()
      const userRequest = isAdmin ? closetCycleApi.adminUsers() : Promise.resolve([])
      const [nextRows, nextUsers] = await Promise.all([reportRequest, userRequest])
      setRows(nextRows)
      setUsers(nextUsers)
      setError('')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load admin data.') }
  }
  useEffect(() => { void refresh() }, [isAdmin])
  const act = async (id: number, status: 'RESOLVED' | 'DISMISSED') => { setBusyId(id); try { await closetCycleApi.updateReport(id, status); await refresh() } catch (e) { setError(e instanceof Error ? e.message : 'Could not update this report.') } finally { setBusyId(null) } }
  const changeRole = async (id: number, role: 'MEMBER' | 'MODERATOR' | 'ADMIN') => {
    setRoleBusyId(id)
    try { await closetCycleApi.updateAdminUserRole(id, role); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not update this user role.') }
    finally { setRoleBusyId(null) }
  }
  const issueCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setCodeBusy(true); setError(''); setIssuedCode(null); setCodeNotice('')
    const form = new FormData(event.currentTarget)
    const expiry = String(form.get('expiresAt') || '')
    try {
      setIssuedCode(await closetCycleApi.createAdminProCode({
        plan: String(form.get('plan')) === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY',
        ...(expiry ? { expiresAt: new Date(expiry).toISOString() } : {}),
      }))
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not generate an activation code.') }
    finally { setCodeBusy(false) }
  }
  const copyCode = async () => {
    if (!issuedCode) return
    try { await navigator.clipboard.writeText(issuedCode.code); setCodeNotice('Code copied. It will not be shown again after leaving this page.') }
    catch { setCodeNotice('Clipboard access is unavailable. Copy the code shown below and share it securely.') }
  }
  const openReports = rows.filter(row => row.status === 'OPEN')
  const filteredUsers = users.filter(user =>
    `${user.displayName} ${user.email} ${user.area}`.toLowerCase().includes(userQuery.toLowerCase()))
  return <main className="admin-page">
    <div className="admin-head"><div><p className="eyebrow">{isAdmin ? 'Administrator console' : 'Moderator console'}</p><h1>Community operations</h1></div><Button kind="secondary" onClick={() => void refresh()} disabled={!!busyId}>Refresh</Button></div>
    {error && <p className="error-message" role="alert">{error}</p>}
    <nav className="admin-tabs" aria-label="Admin sections">
      <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
      {isAdmin && <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>}
      <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Reports</button>
      {isAdmin && <button className={activeTab === 'codes' ? 'active' : ''} onClick={() => setActiveTab('codes')}>Promotion codes</button>}
    </nav>
    {activeTab === 'overview' && <>
      <section className="admin-stats">
        <div><strong>{users.length}</strong><span>Registered users</span></div>
        <div><strong>{openReports.length}</strong><span>Open reports</span></div>
        <div><strong>{users.filter(user => user.role === 'ADMIN').length}</strong><span>Administrators</span></div>
        <div><strong>{users.filter(user => user.role === 'MODERATOR').length}</strong><span>Moderators</span></div>
      </section>
      <div className="admin-overview-grid">
        <section className="admin-table"><div className="section-head"><div><h2>Priority reports</h2><p>Newest community concerns requiring review.</p></div></div>
          {openReports.slice(0, 5).map(row => <div className="admin-list-row" key={row.id}><div><strong>{row.itemTitle}</strong><small>#{row.id} · {row.reason}</small></div><button onClick={() => { setActiveTab('reports') }}>Review</button></div>)}
          {openReports.length === 0 && <p className="empty-state">No open reports.</p>}
        </section>
        {isAdmin && <section className="demo-checkout admin-code-panel"><p className="eyebrow">Quick action</p><h2>Generate promotion code</h2><p>Create a one-time Closet Cycle Pro activation code.</p><Button onClick={() => setActiveTab('codes')}>Open code manager</Button></section>}
      </div>
    </>}
    {isAdmin && activeTab === 'users' && <section className="admin-table"><div className="section-head"><div><h2>User management</h2><p>Search accounts and assign community roles.</p></div><input className="admin-search" value={userQuery} onChange={event => setUserQuery(event.target.value)} placeholder="Search name, email or area" /></div>
      <div className="admin-user-list">{filteredUsers.map(user => <div className="admin-user-row" key={user.id}><div className="admin-avatar">{user.displayName.slice(0, 1).toUpperCase()}</div><div className="admin-user-info"><strong>{user.displayName}</strong><small>{user.email} · {user.area}</small></div><span>{user.creditBalance} credits</span><select aria-label={`Role for ${user.displayName}`} value={user.role} disabled={roleBusyId === user.id || user.id === currentUserId} title={user.id === currentUserId ? 'You cannot change your own role' : undefined} onChange={event => void changeRole(user.id, event.target.value as 'MEMBER' | 'MODERATOR' | 'ADMIN')}><option value="MEMBER">Member</option><option value="MODERATOR">Moderator</option><option value="ADMIN">Administrator</option></select></div>)}</div>
      {filteredUsers.length === 0 && <p className="empty-state">No users match this search.</p>}
    </section>}
    {activeTab === 'reports' && <section className="admin-table"><div className="section-head"><div><h2>Listing reports</h2><p>Resolve or dismiss reports after review.</p></div><span>{openReports.length} open</span></div><table><thead><tr><th>Report</th><th>Reason</th><th>Listing</th><th>Member</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>#{row.id}</td><td>{row.reason}<small>{row.details}</small></td><td><button onClick={() => go(`item/${row.itemId}`)}>{row.itemTitle}</button></td><td>{row.reporterName}</td><td><span className={`status-pill ${row.status.toLowerCase()}`}>{row.status}</span></td><td>{row.status === 'OPEN' && <><button disabled={busyId === row.id} onClick={() => void act(row.id, 'RESOLVED')}>Resolve</button><button disabled={busyId === row.id} onClick={() => void act(row.id, 'DISMISSED')}>Dismiss</button></>}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="empty-state">No reports have been submitted.</p>}</section>}
    {isAdmin && activeTab === 'codes' && <section className="demo-checkout admin-code-panel"><p className="eyebrow">Pro membership</p><h2>Generate an activation code</h2><p>Create a single-use code and share it privately with the intended member.</p><form className="admin-code-form" onSubmit={issueCode}><label>Membership period<select name="plan"><option value="MONTHLY">Monthly · 1 month</option><option value="ANNUAL">Annual · 12 months</option></select></label><label>Code expiry <span>(optional)</span><input type="datetime-local" name="expiresAt" /></label><Button type="submit" disabled={codeBusy}>{codeBusy ? 'Generating…' : 'Generate code'}</Button></form>{issuedCode && <div className="issued-code"><label htmlFor="issued-pro-code">New {issuedCode.plan.toLowerCase()} code</label><div><input id="issued-pro-code" readOnly value={issuedCode.code} /><Button kind="secondary" onClick={() => void copyCode()}>Copy code</Button></div>{issuedCode.expiresAt && <small>Expires {new Date(issuedCode.expiresAt).toLocaleString()}</small>}{codeNotice && <small role="status">{codeNotice}</small>}</div>}</section>}
  </main>
}
export default function App() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'home')
  const [saved, setSaved] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('closet_cycle_saved') || '[2,5]') } catch { return [2, 5] } })
  const [items, setItems] = useState<Listing[]>(listings)
  const [backendOnline, setBackendOnline] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string; area: string }>(() => {
    try { return JSON.parse(localStorage.getItem('closet_cycle_user') || '{"id":1,"name":"Maya Jensen","email":"maya@closetcycle.local","area":"North Campus"}') }
    catch { return { id: 1, name: 'Maya Jensen', email: 'maya@closetcycle.local', area: 'North Campus' } }
  })
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem('closet_cycle_access_token')))
  useEffect(() => { const onHash = () => setRoute(window.location.hash.slice(1) || 'home'); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash) }, [])
  useEffect(() => {
    let active = true
    closetCycleApi.listItems().then(rows => { if (active) { setItems(rows.map(fromApiItem)); setBackendOnline(true) } }).catch(() => { if (active) setBackendOnline(false) })
    return () => { active = false }
  }, [])
  const onSave = (id: number) => setSaved(current => { const next = current.includes(id) ? current.filter(y => y !== id) : [...current, id]; localStorage.setItem('closet_cycle_saved', JSON.stringify(next)); return next })
  const onAuthenticated = (user: { id: number; name: string; email: string; area: string }) => { setCurrentUser(user); setAuthenticated(true) }
  const onSignOut = () => { localStorage.removeItem('closet_cycle_access_token'); localStorage.removeItem('closet_cycle_user'); setAuthenticated(false); setCurrentUser({ id: 1, name: 'Maya Jensen', email: 'maya@closetcycle.local', area: 'North Campus' }); go('signin') }
  const base = route.split('/')[0]
  const id = Number(route.split('/')[1]) || 1
  const item = items.find(x => x.id === id) || items[0] || listings[0]
  const fullScreen = base === 'signin'
  const privateRoute = ['request', 'wardrobe', 'exchanges', 'wallet', 'list', 'profile', 'report', 'admin'].includes(base)
  const roles: string[] = (() => { try { const token = localStorage.getItem('closet_cycle_access_token'); if (!token) return []; const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); return payload.roles || [] } catch { return [] } })()
  const moderator = roles.includes('MODERATOR') || roles.includes('ADMIN')
  const administrator = roles.includes('ADMIN')
  let page: ReactNode
  if (privateRoute && !authenticated) page = <AuthRequired destination={route} />
  else if (base === 'home') page = <Home saved={saved} onSave={onSave} items={items} />
  else if (base === 'browse') page = <Browse saved={saved} onSave={onSave} items={items} />
  else if (base === 'item') page = <ItemPage item={item} saved={saved.includes(item.id)} onSave={onSave} items={items} authenticated={authenticated} />
  else if (base === 'request') page = <RequestPage item={item} items={items} backendOnline={backendOnline} userId={currentUser.id} />
  else if (base === 'report') page = <ReportPage item={item} />
  else if (base === 'wardrobe') page = backendOnline ? <LiveWardrobe userId={currentUser.id} saved={saved} items={items} onSave={onSave} /> : <Wardrobe saved={saved} />
  else if (base === 'exchanges') page = backendOnline ? <LiveExchanges userId={currentUser.id} /> : <Exchanges />
  else if (base === 'wallet') page = <Wallet backendOnline={backendOnline} userId={currentUser.id} />
  else if (base === 'pro') page = <ProMembership authenticated={authenticated} email={currentUser.email} />
  else if (base === 'about') page = <AboutPage />
  else if (base === 'how') page = <HowItWorks />
  else if (base === 'list') page = <ListingForm backendOnline={backendOnline} userId={currentUser.id} items={items} onCreated={item => setItems(current => current.some(x => x.id === item.id) ? current.map(x => x.id === item.id ? item : x) : [item, ...current])} />
  else if (base === 'profile') page = <Profile currentUser={currentUser} onSignOut={onSignOut} savedCount={saved.length} onUpdate={user => { setCurrentUser(user); localStorage.setItem('closet_cycle_user', JSON.stringify(user)) }} />
  else if (base === 'signin') page = <SignIn onAuthenticated={onAuthenticated} />
  else if (['safety', 'terms', 'privacy'].includes(base)) page = <InfoPage type={base} />
  else if (base === 'help') page = <Help />
  else if (base === 'admin' && moderator) page = <Admin isAdmin={administrator} currentUserId={currentUser.id} />
  else if (base === 'admin') page = <main className="page narrow"><div className="empty-state"><h1>Moderator access required</h1><p>This page is available only to accounts assigned the moderator or administrator role.</p><Button kind="secondary" onClick={() => go('home')}>Return home</Button></div></main>
  else page = <Home saved={saved} onSave={onSave} items={items} />
  return <div className="app">{!fullScreen && <Header route={base} userName={currentUser.name} authenticated={authenticated} />}<div key={route} className="page-transition">{page}</div>{!fullScreen && base !== 'admin' && <Footer />}{!fullScreen && <MobileNav route={base} />}</div>
}
