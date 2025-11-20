import logging
import queue
import threading

class LogStreamHandler(logging.Handler):
    """Custom handler that broadcasts logs to all connected clients"""
    
    def __init__(self):
        super().__init__()
        self.queues = []
        self.lock = threading.Lock()
    
    def emit(self, record):
        msg = self.format(record)
        with self.lock:
            # Send to all connected clients
            for q in self.queues:
                try:
                    q.put_nowait(msg)
                except queue.Full:
                    pass
    
    def add_client(self):
        """Add a new client queue"""
        q = queue.Queue(maxsize=100)
        with self.lock:
            self.queues.append(q)
        return q
    
    def remove_client(self, q):
        """Remove a client queue"""
        with self.lock:
            if q in self.queues:
                self.queues.remove(q)

# Global log streamer
log_streamer = LogStreamHandler()
log_streamer.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s'))
