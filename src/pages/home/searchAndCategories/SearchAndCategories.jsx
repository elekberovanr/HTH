import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProductsByCategory, fetchProducts } from '../../../redux/reducers/productSlice';
import styles from './SearchAndCategories.module.css'


const SearchAndCategories = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const selected = localStorage.getItem('selectedCategory');
    if (selected) {
      dispatch(fetchProductsByCategory(selected)); 
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch]);


  return (
    <div className={styles.container}>
      <SearchBar />
    </div>
  );
};

export default SearchAndCategories;
