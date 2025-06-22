"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Package, Plus, Edit, Trash2, MapPin } from "lucide-react"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  images: string[]
  seller: string
  location?: {
    coordinates: [number, number] // [longitude, latitude]
  }
}

interface ProductManagerProps {
  onProductUpdate: () => void
}

export default function ProductManager({ onProductUpdate }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [""],
    location: {
      longitude: "",
      latitude: ""
    }
  })
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await apiClient.getProducts()
      // Ensure data is an array before setting it
      setProducts(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([]) // Set empty array on error
    }
  }

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      images: [""],
      location: {
        longitude: "",
        latitude: ""
      }
    })
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...productForm,
        price: Number.parseFloat(productForm.price),
        stock: Number.parseInt(productForm.stock),
        images: productForm.images.filter((img) => img.trim() !== ""),
        location: 
          productForm.location.latitude && productForm.location.longitude 
            ? {
                coordinates: [
                  Number.parseFloat(productForm.location.longitude),
                  Number.parseFloat(productForm.location.latitude)
                ]
              }
            : undefined
      }

      if (editingProduct) {
        await apiClient.updateProduct(editingProduct._id, productData)
        toast({
          title: "Success",
          description: "Product updated successfully!",
        })
      } else {
        await apiClient.createProduct(productData)
        toast({
          title: "Success",
          description: "Product created successfully!",
        })
      }

      loadProducts()
      onProductUpdate()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    
    // Check if product has location and coordinates before accessing them
    const longitude = product.location?.coordinates?.[0]?.toString() || "";
    const latitude = product.location?.coordinates?.[1]?.toString() || "";
    
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "0",
      category: product.category || "",
      stock: product.stock?.toString() || "0",
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [""],
      location: {
        longitude,
        latitude,
      }
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await apiClient.deleteProduct(productId)
      loadProducts()
      onProductUpdate()
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Delete failed",
        variant: "destructive",
      })
    }
  }

  const addImageField = () => {
    setProductForm({
      ...productForm,
      images: [...productForm.images, ""],
    })
  }

  const updateImageField = (index: number, value: string) => {
    const newImages = [...productForm.images]
    newImages[index] = value
    setProductForm({
      ...productForm,
      images: newImages,
    })
  }

  const removeImageField = (index: number) => {
    const newImages = productForm.images.filter((_, i) => i !== index)
    setProductForm({
      ...productForm,
      images: newImages.length > 0 ? newImages : [""],
    })
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProductForm({
            ...productForm,
            location: {
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            }
          })
          toast({
            title: "Location found",
            description: "Your current location has been added to the product.",
          })
        },
        (error) => {
          toast({
            title: "Error",
            description: "Could not get your location: " + error.message,
            variant: "destructive",
          })
        }
      )
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-green-800 flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Product Management
              </CardTitle>
              <CardDescription className="text-green-600">Manage your product listings</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? "Update your product details" : "Create a new product listing"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                      className="border-green-300 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Product Images (URLs)</Label>
                    {productForm.images.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <Input
                          value={image}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          placeholder="Enter image URL"
                          className="border-green-300 focus:border-green-500"
                        />
                        {productForm.images.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeImageField(index)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImageField}
                      className="mt-2 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Add Image URL
                    </Button>
                  </div>

                  <div>
                    <Label>Product Location</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input
                        placeholder="Latitude"
                        value={productForm.location.latitude}
                        onChange={(e) => 
                          setProductForm({
                            ...productForm,
                            location: { ...productForm.location, latitude: e.target.value }
                          })
                        }
                        className="border-green-300 focus:border-green-500"
                      />
                      <Input
                        placeholder="Longitude"
                        value={productForm.location.longitude}
                        onChange={(e) => 
                          setProductForm({
                            ...productForm,
                            location: { ...productForm.location, longitude: e.target.value }
                          })
                        }
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getUserLocation}
                      className="mt-2 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Use My Current Location
                    </Button>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                      {editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              No products found. Create your first product to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product._id} className="border-green-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-green-800">{product.name}</CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-800">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-green-600">Stock: {product.stock}</span>
                    </div>
                    {product.location?.coordinates && (
                      <div className="mt-2 text-xs flex items-center text-green-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location added
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
