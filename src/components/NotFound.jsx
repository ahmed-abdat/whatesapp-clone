import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BsWhatsapp } from 'react-icons/bs';
import { MdError } from 'react-icons/md';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-primary/10 to-whatsapp-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center shadow-2xl">
        <CardHeader className="space-y-4">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <MdError className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-900">
            404
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Page Not Found
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Sorry, the page you are looking for could not be found. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* WhatsApp branding */}
          <div className="flex items-center justify-center gap-2 text-whatsapp-primary">
            <BsWhatsapp className="w-5 h-5" />
            <span className="font-medium">WhatsApp Clone</span>
          </div>

          {/* Action Button */}
          <Button 
            asChild
            className="w-full bg-whatsapp-primary hover:bg-whatsapp-primary-dark"
          >
            <Link to="/">
              العودة للصفحة الرئيسية
            </Link>
          </Button>

          {/* Additional help */}
          <p className="text-xs text-gray-500">
            If you continue to see this error, please check the URL or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFound;
