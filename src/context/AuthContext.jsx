import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, provider, ADMIN_EMAIL } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setIsAdmin(firebaseUser.email === ADMIN_EMAIL)
        setLoading(false) // unblock UI immediately

        // Save/update user record in Firestore (background — non-blocking)
        const ref = doc(db, 'users', firebaseUser.uid)
        getDoc(ref).then(snap => {
          if (!snap.exists()) {
            setDoc(ref, {
              uid:         firebaseUser.uid,
              email:       firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL:    firebaseUser.photoURL,
              joinedAt:    new Date().toISOString(),
            })
          }
        }).catch(err => console.error('User record sync error:', err))
      } else {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Sign-in error:', err)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
