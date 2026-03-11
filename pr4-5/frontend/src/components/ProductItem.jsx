import React from 'react';

function Stars({ rating }) {
  if (rating == null) return <span className="noRating">Нет оценки</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= full ? 'star--on' : (i === full + 1 && half ? 'star--half' : '')}`}>★</span>
      ))}
      <span className="ratingVal">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductItem({ product, onEdit, onDelete }) {
  const isFree = product.price === 0;
  return (
    <div className="card">
      <div className="card__img">
        {product.image
          ? <img src={product.image} alt={product.name} />
          : <div className="card__imgPlaceholder">💿</div>
        }
        <span className="card__category">{product.category}</span>
      </div>
      <div className="card__body">
        <div className="card__name">{product.name}</div>
        <div className="card__desc">{product.description}</div>
        <Stars rating={product.rating} />
        <div className="card__footer">
          <div className="card__priceRow">
            <span className={`card__price ${isFree ? 'card__price--free' : ''}`}>
              {isFree ? 'Бесплатно' : `${product.price.toLocaleString('ru-RU')} ₽/год`}
            </span>
            <span className={`card__stock ${product.stock === 0 ? 'card__stock--out' : ''}`}>
              {product.stock > 0 ? `${product.stock} лиц.` : 'Нет'}
            </span>
          </div>
          <div className="card__actions">
            <button className="btn" onClick={() => onEdit(product)}>✏ Изменить</button>
            <button className="btn btn--danger" onClick={() => onDelete(product.id)}>✕ Удалить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
