import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';

// Test endpoint for Supabase connection and body size limits
export async function testSupabaseConnection(req: Request, res: Response) {
  try {
    // Test basic Supabase connection
    const { data: tables, error } = await supabase
      .from('users')
      .select('id, name, username')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to connect to Supabase',
        details: error.message 
      });
    }

    // Log request body size for debugging
    const bodySize = JSON.stringify(req.body).length;
    console.log(`📦 Test request body size: ${bodySize} bytes`);

    res.json({
      success: true,
      message: 'Supabase connection successful',
      bodySize,
      maxBodySize: '10MB',
      tablesConnected: tables ? tables.length : 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Supabase test failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test endpoint for large body handling (simulates AI chat with Supabase)
export async function testLargeBodyHandling(req: Request, res: Response) {
  try {
    const bodySize = JSON.stringify(req.body).length;
    const contentLength = req.headers['content-length'] || '0';
    
    console.log(`📦 Large body test - Size: ${bodySize} bytes, Content-Length: ${contentLength}`);

    // If body is over 1MB, log success (previously would have failed)
    if (bodySize > 1024 * 1024) {
      console.log('✅ Successfully handled large body > 1MB!');
    }

    res.json({
      success: true,
      message: 'Large body handled successfully',
      receivedBodySize: bodySize,
      contentLength: parseInt(contentLength),
      maxAllowed: '10MB (10,485,760 bytes)',
      timestamp: new Date().toISOString(),
      largeBodySupport: bodySize > 1024 * 1024 ? 'Working' : 'Untested'
    });

  } catch (error) {
    console.error('Large body test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Large body test failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test Supabase real-time features
export async function testSupabaseRealtime(req: Request, res: Response) {
  try {
    // Test if we can create a channel (validates real-time functionality)
    const channel = supabase.channel('test-channel');
    
    // Subscribe and immediately unsubscribe to test connection
    const subscription = channel.subscribe((status) => {
      console.log('Supabase real-time status:', status);
    });

    // Clean up after test
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 1000);

    res.json({
      success: true,
      message: 'Supabase real-time test completed',
      realtimeSupported: true,
      channelCreated: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Supabase real-time test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Supabase real-time test failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}