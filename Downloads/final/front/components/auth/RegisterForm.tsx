"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface RegisterFormProps {
  userType: 'user' | 'business'
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ userType, onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: userType,
    businessName: "",
    businessType: "",
    location: {
      address: "",
      coordinates: { lat: 0, lng: 0 },
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const registerPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
        ...(userType === 'business' && {
          businessName: formData.businessName,
          businessType: formData.businessType,
          location: formData.location.address ? formData.location : undefined,
        }),
      }

      await register(registerPayload)
      
      toast({
        title: "Success",
        description: `Account created successfully! Welcome to LocalConnect.`,
      })
      
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{userType === 'business' ? 'Contact Name' : 'Full Name'}</Label>
        <Input
          id="name"
          type="text"
          placeholder={userType === 'business' ? 'Enter contact person name' : 'Enter your full name'}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      {userType === 'business' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              type="text"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select onValueChange={(value) => handleInputChange('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="retail">Retail Store</SelectItem>
                <SelectItem value="service">Service Provider</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                <SelectItem value="professional">Professional Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="Enter your business address"
              value={formData.location.address}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Creating Account...' : `Sign Up ${userType === 'business' ? 'as Business' : 'as User'}`}
      </Button>
    </form>
  )
}
