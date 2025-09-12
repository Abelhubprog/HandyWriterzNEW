
import React from 'react';
import { ServicePage, ContentBlock } from '@/services/contentManagementService';
import {
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Award,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

interface ServicePageRendererProps {
  page: ServicePage;
  className?: string;
}

const ServicePageRenderer: React.FC<ServicePageRendererProps> = ({ page, className = '' }) => {

  const renderContentBlock = (block: ContentBlock) => {
    const { type, content } = block;

    switch (type) {
      case 'heading':
        const HeadingTag = `h${content.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            key={block.id}
            className={`font-bold text-gray-900 mb-4 ${
              content.level === 1 ? 'text-4xl md:text-5xl' :
              content.level === 2 ? 'text-3xl md:text-4xl' :
              content.level === 3 ? 'text-2xl md:text-3xl' :
              'text-xl md:text-2xl'
            } ${content.textAlign || 'text-center'}`}
            style={{ color: content.color }}
          >
            {content.text}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <div
            key={block.id}
            className={`prose prose-lg max-w-none mb-6 ${content.textAlign || 'text-left'}`}
            style={{ color: content.color }}
          >
            <p dangerouslySetInnerHTML={{ __html: content.text }} />
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className={`mb-8 ${content.alignment || 'text-center'}`}>
            <img
              src={content.src}
              alt={content.alt || ''}
              className={`${content.rounded ? 'rounded-lg' : ''} ${content.shadow ? 'shadow-lg' : ''} max-w-full h-auto`}
              style={{
                width: content.width || 'auto',
                height: content.height || 'auto'
              }}
            />
            {content.caption && (
              <p className="text-sm text-gray-600 mt-2 italic">{content.caption}</p>
            )}
          </div>
        );

      case 'cta':
        return (
          <div key={block.id} className={`mb-8 ${content.alignment || 'text-center'}`}>
            <div className={`inline-block p-6 rounded-xl ${content.bgColor || 'bg-blue-50'} ${content.borderColor || 'border border-blue-200'}`}>
              {content.title && (
                <h3 className={`text-xl font-bold mb-2 ${content.titleColor || 'text-gray-900'}`}>
                  {content.title}
                </h3>
              )}
              {content.description && (
                <p className={`mb-4 ${content.textColor || 'text-gray-600'}`}>
                  {content.description}
                </p>
              )}
              <a
                href={content.buttonLink || '#'}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  content.buttonStyle === 'outline'
                    ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <span>{content.buttonText || 'Get Started'}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        );

      case 'feature_list':
        return (
          <div key={block.id} className="mb-12">
            {content.title && (
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {content.title}
              </h3>
            )}
            <div className={`grid gap-6 ${
              content.layout === '2-column' ? 'md:grid-cols-2' :
              content.layout === '3-column' ? 'md:grid-cols-3' :
              content.layout === '4-column' ? 'md:grid-cols-2 lg:grid-cols-4' :
              'grid-cols-1'
            }`}>
              {content.features?.map((feature: any, index: number) => {
                const getIcon = (iconName: string) => {
                  const iconMap: Record<string, any> = {
                    check: CheckCircle,
                    star: Star,
                    users: Users,
                    award: Award,
                    clock: Clock,
                    shield: Shield,
                    zap: Zap,
                  };
                  return iconMap[iconName] || CheckCircle;
                };

                const IconComponent = getIcon(feature.icon);

                return (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${feature.iconBg || 'bg-blue-100'}`}>
                      <IconComponent className={`h-5 w-5 ${feature.iconColor || 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div key={block.id} className="mb-12">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="max-w-3xl mx-auto text-center">
                {content.quote && (
                  <blockquote className="text-xl md:text-2xl font-medium text-gray-900 mb-6">
                    "{content.quote}"
                  </blockquote>
                )}
                <div className="flex items-center justify-center space-x-4">
                  {content.avatar && (
                    <img
                      src={content.avatar}
                      alt={content.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    {content.name && (
                      <div className="font-semibold text-gray-900">{content.name}</div>
                    )}
                    {content.title && (
                      <div className="text-gray-600">{content.title}</div>
                    )}
                    {content.company && (
                      <div className="text-gray-500 text-sm">{content.company}</div>
                    )}
                  </div>
                </div>
                {content.rating && (
                  <div className="flex justify-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < content.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div key={block.id} className="mb-12">
            {content.title && (
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {content.title}
              </h3>
            )}
            <div className="max-w-3xl mx-auto space-y-4">
              {content.faqs?.map((faq: any, index: number) => (
                <details key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <summary className="cursor-pointer p-6 font-medium text-gray-900 hover:bg-gray-50">
                    {faq.question}
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        );

      case 'video':
        return (
          <div key={block.id} className="mb-8">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              {content.type === 'embed' ? (
                <iframe
                  src={content.embedUrl}
                  title={content.title || 'Video'}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video
                  src={content.videoUrl}
                  poster={content.posterImage}
                  controls={content.showControls !== false}
                  autoPlay={content.autoPlay}
                  muted={content.muted}
                  loop={content.loop}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {content.caption && (
              <p className="text-center text-gray-600 mt-4">{content.caption}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`service-page ${className}`}>
      {/* SEO Meta Tags */}
      <head>
        <title>{page.metaTitle || page.title}</title>
        <meta name="description" content={page.metaDescription || page.description} />
        <meta property="og:title" content={page.metaTitle || page.title} />
        <meta property="og:description" content={page.metaDescription || page.description} />
        {page.featuredImage && <meta property="og:image" content={page.featuredImage} />}
      </head>

      {/* Hero Section */}
      {page.featuredImage && (
        <div className="relative bg-gray-900 mb-12">
          <div className="absolute inset
