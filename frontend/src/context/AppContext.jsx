import { createContext, useEffect,useState } from "react";
import axios from 'axios'
import {toast} from "react-toastify"
export const AppContext=createContext()
const AppContextProvider=(props)=>{
    const [search,setSearch]=useState('')
    const currencySymbol='$'
    const backendurl=import.meta.env.VITE_BACKEND_URL
    const [userData,setUserData]=useState(false)
    const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token'):false);
    const [products,setProducts]=useState([]);
    const [cart,setCart]=useState([]);
    const [replies,setReplies] =useState([])
    const [myReplies,setMyReplies]=useState([])
    const [comments,setComments]=useState([])
    const [notifications,setNotifications]=useState(null)
    const [messages, setMessages] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [guestCart, setGuestCart] = useState(JSON.parse(localStorage.getItem('guestCart')) || []);

    const fetchCartCount = async () => {
        try {
            const tkn = localStorage.getItem('token');
            if (!tkn) {
                const count = guestCart.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
                return;
            };
            const {data} = await axios.post(backendurl+'/api/shopping-cart/count',{},{headers:{token: tkn}});
            if (data.success) setCartCount(data.totalItems);
        } catch (e) { console.log(e); }
    };

    const addToCart = async (productId, quantity, productData) => {
        if (token) {
            try {
                const { data } = await axios.post(backendurl + '/api/shopping-cart/add', { productId, quantity }, { headers: { token } });
                if (data.success) {
                    toast.success("Đã thêm vào giỏ hàng!");
                    setCartCount(data.totalItems);
                }
            } catch (error) {
                toast.error("Không thể thêm vào giỏ hàng");
            }
        } else {
            // Guest Cart Logic
            let updatedCart = [...guestCart];
            const existingItem = updatedCart.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                updatedCart.push({
                    productId,
                    quantity,
                    product: productData // Store minimal product info for offline display
                });
            }
            setGuestCart(updatedCart);
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
            toast.success("Đã thêm vào giỏ hàng (Khách)!");
            setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
        }
    };

    const updateCartItem = async (productId, quantity) => {
        if (token) {
            try {
                const { data } = await axios.post(backendurl + '/api/shopping-cart/update', { productId, quantity }, { headers: { token } });
                if (data.success) {
                    setCartCount(data.totalItems);
                    return data;
                }
            } catch (error) {
                toast.error("Không thể cập nhật giỏ hàng");
            }
        } else {
            let updatedCart = guestCart.map(item => 
                item.productId === productId ? { ...item, quantity } : item
            );
            setGuestCart(updatedCart);
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
            return { success: true, items: updatedCart, totalItems: updatedCart.reduce((acc, item) => acc + item.quantity, 0), totalPrice: updatedCart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) };
        }
    };

    const removeFromCart = async (productId) => {
        if (token) {
            try {
                const { data } = await axios.post(backendurl + '/api/shopping-cart/remove', { productId }, { headers: { token } });
                if (data.success) {
                    setCartCount(data.totalItems);
                    toast.success("Đã xóa khỏi giỏ hàng");
                    return data;
                }
            } catch (error) {
                toast.error("Không thể xóa sản phẩm");
            }
        } else {
            let updatedCart = guestCart.filter(item => item.productId !== productId);
            setGuestCart(updatedCart);
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
            toast.success("Đã xóa khỏi giỏ hàng (Khách)");
            return { success: true, items: updatedCart, totalItems: updatedCart.reduce((acc, item) => acc + item.quantity, 0), totalPrice: updatedCart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) };
        }
    };
    const addMessages = async(newMsgs) => {
        try {
            const a = await axios.post(backendurl+'/api/user/ask-and-save-groq',{message: newMsgs},{headers:{token}});
            if (!a) toast.error("Can't send message");
            setMessages(a.data.data);
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
      };
    const getMessages = async()=>{
        try {
            const x= await axios.get(backendurl+'/api/user/get-conversation',{headers:{token}});
            if (!x || !x.data) toast.error("AI chat is now not available !")
            setMessages(x.data.data)  
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }
    const clearMessages= async()=>{
        try {
            await axios.post(backendurl+'/api/user/delete-conversation',{},{headers:{token}})
            await getMessages();
            toast.success("Delete messages successfully")
        } catch (error) {
            console.log(error);
            toast.error("Can't delete message");
        }
    }
    const getComments = async ()=>{
        try {
            const {data}=await axios.get(backendurl+'/api/comment/get-comments',{headers:{token}});
            if (!data) toast.warn("No comment or error connect server");
            setComments(data.comments);
        } catch (error) {
            toast.error(error.message);
            console.log(error);
            
        }
    }
     const deleteUser = async()=>{
        try {
            await axios.post(backendurl+'/api/user/delete-user',{},{headers:{token}});
            toast.success("Delete user successfully. Let's navigate to home page without sign in")
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }
    const getRepliesByUser = async ()=>{
        try {
            const {data}=await axios.get(backendurl+'/api/user/get-my-replies',{headers:{token}})
            if (!data) toast.warn("No replies yet or Error connect server")
            setMyReplies(data.replies);
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }
    const getAllReplies = async ()=>{
        try {
            const {data}=await axios.get(backendurl+'/api/user/get-all-replies',{headers:{token}})
            if (!data) toast.warn("No replies yet or Error connect server")
            setReplies(data.replies);
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }
    const getProductsData = async ()=>{
        try {
            const {data}= await axios.get(backendurl+'/api/product/get-products')
            if (data && data.success) {
                setProducts(data.products);
            } else {
                toast.error("chả thấy data nảo cả")
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const getUserData=async()=>{
        try {
            const {data}= await axios.get(backendurl+'/api/user/get-profile',{headers:{token}})
            if (data.success) {
                setUserData(data.userData)
                
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }
    const getNotifications = async ()=>{
        try {
            const {data} = await axios.get(backendurl+'/api/user/get-notifications',{headers:{token}});
            if (!data) toast.error("Data not found")
            setNotifications(data.data)
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    } 
    const markOneAsRead= async(notificationId)=>{
        try {
         await axios.post(backendurl+'/api/user/mark-one-as-read',{notificationId},{headers:{token}})
            
        } catch (error) {
            toast.error(error.message)
            console.log(error);
            
        }
    }   
    const markAllAsRead = async () => {
        try {
            await axios.post(
                backendurl + '/api/user/mark-all-as-read',
                {}, 
                { headers: { token } }
            );
                toast.success("All notifications marked as read");
            
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };
    const sendChangePassword = async (email) =>{
        try {
            await axios.post(backendurl+'/api/user/forgot-password',{email});
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }
    const value={
        search,
        setSearch,
        products,
        setProducts,
        token,setToken,
        currencySymbol,
        userData, 
        setUserData, 
        getUserData,
        getProductsData,
        backendurl,
        getRepliesByUser, replies,setReplies,
        comments, getComments, setComments,
        getNotifications, notifications,
        markAllAsRead,markOneAsRead,
        clearMessages,addMessages,setMessages,messages,getMessages,
        sendChangePassword,deleteUser,
        cartCount, setCartCount, fetchCartCount,
        guestCart, setGuestCart, addToCart, updateCartItem, removeFromCart
    }
    
    useEffect(() => {
        const fetchInitialData = async () => {
          try {
            await Promise.all([
              getProductsData(),
              getAllReplies()
            ]);
          } catch (error) {
            console.error("Error fetching initial data", error);
          }
        };
      
        fetchInitialData();
      }, []);
      
      useEffect(() => {
        const fetchUserData = async () => {
          if (token) {
            await getUserData();
            await fetchCartCount();
          } else {
            setUserData(false);
            const count = guestCart.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
          }
        };
      
        fetchUserData();
      }, [token]);
    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider
