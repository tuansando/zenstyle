import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Newspaper, X } from 'lucide-react'
import { blogService } from '../services/dataService'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Blog = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBlog, setSelectedBlog] = useState(null)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await blogService.getPublished()
      setBlogs(response.data || response || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
      toast.error('Unable to load news')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <section className="section-zen bg-gradient-to-r from-zen-600 to-zen-800 text-white">
        <div className="container-zen text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-zen font-bold mb-4"
          >
            News & Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-90"
          >
            Discover beauty secrets and latest trends
          </motion.p>
        </div>
      </section>

      <div className="container-zen py-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="loader-zen"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zen-600 text-xl">No news available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedBlog(blog)}
                className="card-zen cursor-pointer group hover:shadow-xl transition-all duration-300"
              >
                {blog.image_url ? (
                  <div className="h-48 rounded-xl mb-4 overflow-hidden">
                    <img 
                      src={blog.image_url} 
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-zen-200 to-zen-300 rounded-xl mb-4 flex items-center justify-center">
                    <Newspaper size={64} className="text-zen-600" />
                  </div>
                )}
                <div className="flex items-center space-x-2 text-zen-500 text-sm mb-3">
                  <Calendar size={16} />
                  <span>{blog.created_at ? format(new Date(blog.created_at), 'dd/MM/yyyy') : 'N/A'}</span>
                </div>
                <h2 className="text-2xl font-zen font-semibold text-zen-800 mb-2 group-hover:text-zen-600 transition-colors">
                  {blog.title}
                </h2>
                <p className="text-zen-600 mb-4 line-clamp-3">{blog.content}</p>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-zen-200">
                  <span className="text-zen-500">{blog.author?.name || 'Admin'}</span>
                  <span className="text-zen-600 group-hover:text-zen-800 font-medium">Read More →</span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-zen-200 px-8 py-6 flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-3xl font-zen font-bold text-zen-800 mb-3">
                    {selectedBlog.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-zen-500">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>
                        {selectedBlog.created_at ? format(new Date(selectedBlog.created_at), 'dd/MM/yyyy') : 'N/A'}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-2">
                      <Newspaper size={16} />
                      <span>{selectedBlog.author?.name || 'Admin'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="p-2 hover:bg-zen-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-zen-600" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                {selectedBlog.image_url && (
                  <div className="mb-6">
                    <img 
                      src={selectedBlog.image_url} 
                      alt={selectedBlog.title}
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="prose prose-lg max-w-none">
                  <p className="text-zen-700 leading-relaxed whitespace-pre-line">
                    {selectedBlog.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-zen-200 px-8 py-6 bg-zen-50">
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="btn-zen w-full"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Blog
