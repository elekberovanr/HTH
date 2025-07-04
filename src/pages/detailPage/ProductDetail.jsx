import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import styles from './ProductDetail.module.css';
import { useDispatch, useSelector } from 'react-redux';
import API, { addFavorite, removeFavorite, getFavorites } from '../../services/api';
import { fetchChats, setSelectedChat } from '../../redux/reducers/chatSlice';
import { BiMessage } from 'react-icons/bi';
import CommentBox from '../comment/CommentBox';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
        setSelectedImage(res.data.images?.[0]);
      } catch (err) {
        console.error('Məhsul yüklənmədi:', err.message);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      try {
        const favorites = await getFavorites();
        const exists = favorites.some(f => f.product?._id === id);
        setIsFavorited(exists);
      } catch (err) {
        console.error('Favorit yoxlanmadı:', err.message);
      }
    };
    checkFavorite();
  }, [id, user]);

  const handleFavorite = async () => {
    try {
      if (!user) return;
      if (isFavorited) {
        await removeFavorite(id);
        setIsFavorited(false);
      } else {
        await addFavorite(id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Favorit xətası:', err.message);
    }
  };

  const handleStartChat = async () => {
    if (!user || user._id === product.user._id) return;
    try {
      const res = await API.post('/chat', { receiverId: product.user._id });
      const chatId = res.data._id;
      const chatDetail = await API.get(`/chat/chat-info/${chatId}`);
      dispatch(fetchChats(user._id));
      dispatch(setSelectedChat(chatDetail.data));
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Chat başlatmaq mümkün olmadı:', err.message);
    }
  };




  if (!product) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.imagesSection}>
        <img
          src={`http://localhost:5555/uploads/${selectedImage}`}
          alt="Seçilmiş"
          className={styles.mainImage}
        />
        <div className={styles.thumbnails}>
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={`http://localhost:5555/uploads/${img}`}
              alt=""
              className={styles.thumbnail}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      </div>

      <div className={styles.infoSection}>
        <Link to={`/user/${product.user._id}`}>
          <div className={styles.owner}>
            {product.user?.profileImage ? (
              <img
                src={`http://localhost:5555/uploads/${product.user.profileImage}`}
                alt="Profil"
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.profileImage}>❓</div>
            )}
            <span className={styles.name}>{product.user?.name}</span>
          </div>
        </Link>

        <div className={styles.textBlock}>
          <h2 className={styles.title}>{product.title}</h2>
          <p className={styles.category}>Category: {product.category?.name}</p>
          <p className={styles.description}>{product.description}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.favBtn} onClick={handleFavorite}>
            {isFavorited ? <FaHeart color="red" /> : <FaRegHeart />}
          </button>
          <button className={styles.chatBtn} onClick={handleStartChat}>
            <BiMessage />Go chat
          </button>
        </div>
      </div>
      <CommentBox productId={product._id} />
    </div>
  );
};

export default ProductDetail;
