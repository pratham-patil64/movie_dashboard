import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import * as React from 'react'; // Import React for React.ButtonHTMLAttributes

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function LogoutButton({ className, ...props }: LogoutButtonProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/') // Redirect to login page
  }

  return (
    <button
      onClick={handleLogout}
      className={className} // Apply the passed className
      {...props} // Pass any other button props
    >
      Logout
    </button>
  )
}
